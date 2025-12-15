/**
 * @fileoverview Login API Endpoint
 *
 * Authenticates users against Cloudflare KV (production) or mock data (local).
 * Implements comprehensive security including rate limiting, account lockout,
 * CSRF protection, and automatic password hash upgrades.
 *
 * @module pages/api/auth/login
 * @see {@link module:lib/auth/kv-auth} - KV authentication functions
 * @see {@link module:lib/auth/rate-limit} - Rate limiting
 * @see {@link module:lib/auth/csrf} - CSRF validation
 *
 * ## Endpoint
 *
 * `POST /api/auth/login`
 *
 * ## Request Body
 *
 * ```json
 * {
 *   "email": "user@example.com",
 *   "password": "userpassword",
 *   "csrfToken": "encrypted-token"
 * }
 * ```
 *
 * ## Response
 *
 * **Success (200):**
 * ```json
 * {
 *   "success": true,
 *   "user": { "id", "email", "name", "role", "accessLevel", "avatar", "bio" }
 * }
 * ```
 * + `Set-Cookie: htwc_session=...; HttpOnly; Secure; SameSite=Strict`
 *
 * **Error (401/429):**
 * ```json
 * { "error": "Invalid credentials" | "Account locked" | "Rate limited" }
 * ```
 *
 * ## Security Features
 *
 * - Rate limiting (5/IP/15min, 10/email/hour)
 * - Account lockout after 20 failed attempts
 * - CSRF token validation
 * - Automatic V1→V2 password hash upgrade
 * - Email confirmation check
 *
 * @author How To Win Capitalism Team
 * @since 1.0.0
 */
import type { APIRoute } from 'astro';
import {
  validateCredentialsWithConfirmation,
  createSession,
  createSessionCookie,
  sanitizeUser,
  needsHashUpgrade,
  upgradePasswordHash,
} from '../../../lib/auth/kv-auth';
import {
  validateCredentialsLocal,
  createSessionLocal,
  createSessionCookieLocal,
} from '../../../lib/auth/local-auth';
import { validateCSRFToken, getRequestMetadata } from '../../../lib/auth/csrf';
import {
  checkRateLimit,
  checkAccountLockout,
  recordRateLimitedAction,
  getRateLimitHeaders,
} from '../../../lib/auth/rate-limit';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse request body
    const body = await request.json();
    const { email, password, csrf_token } = body;

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get request metadata for rate limiting
    const { ip } = getRequestMetadata(request);

    // Check if KV is available (production) or use local fallback (dev)
    const hasKV = (locals as Record<string, unknown>).runtime?.env?.USERS && (locals as Record<string, unknown>).runtime?.env?.SESSIONS;

    // Rate limiting and account lockout (only in production with KV)
    if (hasKV) {
      const USERS = (locals as Record<string, unknown>).runtime?.env?.USERS as KVNamespace;

      // Check account lockout first
      const lockout = await checkAccountLockout(USERS, email);
      if (lockout.locked) {
        return new Response(
          JSON.stringify({ error: lockout.reason }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              ...getRateLimitHeaders(Math.ceil((lockout.until! - Date.now()) / 1000)),
            },
          }
        );
      }

      // Check rate limits
      const rateLimit = await checkRateLimit(USERS, 'login', { ip, email });
      if (!rateLimit.allowed) {
        return new Response(
          JSON.stringify({ error: rateLimit.reason }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              ...getRateLimitHeaders(rateLimit.retryAfter),
            },
          }
        );
      }
    }

    // Validate CSRF token (only in production with CSRF_SECRET)
    const csrfSecret = (locals as Record<string, unknown>).runtime?.env?.CSRF_SECRET;
    if (csrfSecret) {
      if (!csrf_token) {
        return new Response(
          JSON.stringify({ error: 'CSRF token required' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const { ip: csrfIp, country, userAgent } = getRequestMetadata(request);
      const csrfResult = await validateCSRFToken(csrf_token, csrfSecret, csrfIp, country, userAgent);
      if (!csrfResult.valid) {
        console.warn('CSRF validation failed:', csrfResult.error);
        return new Response(
          JSON.stringify({ error: 'Invalid CSRF token' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    if (hasKV) {
      // Production: Use Cloudflare KV
      const USERS = (locals as Record<string, unknown>).runtime?.env?.USERS as KVNamespace;
      const SESSIONS = (locals as Record<string, unknown>).runtime?.env?.SESSIONS as KVNamespace;

      const { user, needsConfirmation } = await validateCredentialsWithConfirmation(
        USERS,
        email,
        password
      );

      if (needsConfirmation) {
        // Record as failed attempt (unconfirmed email counts as failure)
        await recordRateLimitedAction(USERS, 'login', { ip, email }, false);
        return new Response(
          JSON.stringify({
            error: 'Please confirm your email address before logging in. Check your inbox.',
            needsConfirmation: true,
          }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (!user) {
        // Record failed login attempt
        await recordRateLimitedAction(USERS, 'login', { ip, email }, false);
        return new Response(
          JSON.stringify({ error: 'Invalid email or password' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Record successful login (clears failed attempt counter)
      await recordRateLimitedAction(USERS, 'login', { ip, email }, true);

      // Transparently upgrade V1 password hash to V2 (PBKDF2)
      if (needsHashUpgrade(user.passwordHash)) {
        await upgradePasswordHash(USERS, user.id, password);
      }

      const { token, expiresAt } = await createSession(SESSIONS, user.id);

      return new Response(
        JSON.stringify({ success: true, user: sanitizeUser(user) }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': createSessionCookie(token, expiresAt),
          },
        }
      );
    } else {
      // Local dev: Use in-memory mock auth
      console.log('[auth] Using local fallback (KV not available)');

      const user = validateCredentialsLocal(email, password);
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Invalid email or password' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const { token, expiresAt } = createSessionLocal(user.id);

      return new Response(
        JSON.stringify({ success: true, user }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': createSessionCookieLocal(token, expiresAt),
          },
        }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
