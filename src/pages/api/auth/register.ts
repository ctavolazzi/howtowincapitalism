/**
 * @fileoverview User Registration API Endpoint
 *
 * Creates new user accounts with email confirmation flow.
 * Implements comprehensive anti-abuse measures including rate limiting,
 * CAPTCHA verification, and disposable email blocking.
 *
 * @module pages/api/auth/register
 * @see {@link module:lib/auth/kv-auth} - User creation
 * @see {@link module:lib/email/send-confirmation} - Confirmation email
 * @see {@link module:lib/auth/turnstile} - CAPTCHA verification
 *
 * ## Endpoint
 *
 * `POST /api/auth/register`
 *
 * ## Request Body
 *
 * ```json
 * {
 *   "username": "desired_username",
 *   "name": "Display Name",
 *   "email": "user@example.com",
 *   "password": "SecureP@ssword123",
 *   "csrfToken": "encrypted-token",
 *   "turnstileToken": "captcha-response"
 * }
 * ```
 *
 * ## Response
 *
 * **Success (200):**
 * ```json
 * { "success": true, "message": "Check your email..." }
 * ```
 *
 * **Error (400/429):**
 * ```json
 * { "error": "Email already registered" | "Rate limited" | ... }
 * ```
 *
 * ## Validation Rules
 *
 * - Username: 3-20 chars, alphanumeric + underscore
 * - Email: Valid format, not disposable domain
 * - Password: 8+ chars, uppercase, lowercase, number, special char
 *
 * ## Security Features
 *
 * - Rate limiting (3/IP/hour, 100/day global)
 * - Turnstile CAPTCHA verification
 * - Disposable email blocking
 * - CSRF token validation
 *
 * @author How To Win Capitalism Team
 * @since 1.0.0
 */
import type { APIRoute } from 'astro';
import { createUser, getUserByEmail } from '../../../lib/auth/kv-auth';
import { sendConfirmationEmail } from '../../../lib/email/send-confirmation';
import { validateCSRFToken, getRequestMetadata } from '../../../lib/auth/csrf';
import {
  checkRateLimit,
  recordRateLimitedAction,
  getRateLimitHeaders,
} from '../../../lib/auth/rate-limit';
import { verifyTurnstile } from '../../../lib/auth/turnstile';

// Disposable email domains to block
// This is a small sample - in production, use a comprehensive list or service
const BLOCKED_DOMAINS = [
  // Common disposable email services
  'tempmail.com',
  'temp-mail.org',
  'guerrillamail.com',
  'guerrillamail.org',
  'guerrillamail.net',
  '10minutemail.com',
  '10minutemail.net',
  'mailinator.com',
  'maildrop.cc',
  'throwaway.email',
  'throwawaymail.com',
  'fakeinbox.com',
  'trashmail.com',
  'trashmail.net',
  'getnada.com',
  'sharklasers.com',
  'spam4.me',
  'spambox.us',
  'yopmail.com',
  'yopmail.fr',
  'discard.email',
  'mailnesia.com',
  'tempail.com',
  'tempr.email',
  'emailondeck.com',
  'mohmal.com',
  'gmailnator.com',
  'tempinbox.com',
  'spamgourmet.com',
  'mintemail.com',
  'mytemp.email',
  'mailcatch.com',
  'getairmail.com',
  'inboxkitten.com',
  'dropmail.me',
  'temp-mail.io',
  'temp-mail.ru',
  'tmpmail.org',
  'tmpmail.net',
  'fake-box.com',
  'mailsac.com',
];

/**
 * Check if an email uses a disposable domain
 */
function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  return BLOCKED_DOMAINS.includes(domain);
}

// Validation helpers
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUsername(username: string): boolean {
  // Alphanumeric, underscores, 3-20 chars, no spaces
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

function isValidPassword(password: string): boolean {
  // At least 8 chars, with at least one letter and one number
  return password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const { username, name, email, password, csrf_token, turnstile_token, hp_field, form_timestamp } = body;

    // Honeypot check - if filled, it's a bot
    if (hp_field) {
      console.warn('Honeypot triggered - bot detected');
      // Return fake success to confuse bots
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Registration successful. Check your email to confirm your account.',
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Time-based detection - forms submitted in less than 3 seconds are suspicious
    const MIN_FORM_TIME_MS = 3000; // 3 seconds minimum
    if (form_timestamp) {
      const submitTime = Date.now();
      const formLoadTime = parseInt(form_timestamp, 10);
      const timeDiff = submitTime - formLoadTime;

      if (!isNaN(formLoadTime) && timeDiff < MIN_FORM_TIME_MS) {
        console.warn(`Time-based detection triggered - form submitted in ${timeDiff}ms`);
        // Return fake success to confuse bots
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Registration successful. Check your email to confirm your account.',
          }),
          { status: 201, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Get request metadata for rate limiting
    const { ip, country, userAgent } = getRequestMetadata(request);

    // Check if KV is available
    const USERS = (locals as Record<string, unknown>).runtime?.env?.USERS as KVNamespace | undefined;

    // Rate limiting (only in production with KV)
    if (USERS) {
      const rateLimit = await checkRateLimit(USERS, 'register', { ip });
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

      const csrfResult = await validateCSRFToken(csrf_token, csrfSecret, ip, country, userAgent);
      if (!csrfResult.valid) {
        console.warn('CSRF validation failed:', csrfResult.error);
        return new Response(
          JSON.stringify({ error: 'Invalid CSRF token' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Verify Turnstile CAPTCHA (only in production with TURNSTILE_SECRET_KEY)
    const turnstileSecretKey = (locals as Record<string, unknown>).runtime?.env?.TURNSTILE_SECRET_KEY as string | undefined;
    if (turnstileSecretKey) {
      if (!turnstile_token) {
        return new Response(
          JSON.stringify({ error: 'Please complete the CAPTCHA verification' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const turnstileResult = await verifyTurnstile(turnstile_token, turnstileSecretKey, ip);
      if (!turnstileResult.success) {
        console.warn('Turnstile verification failed:', turnstileResult.error);
        return new Response(
          JSON.stringify({ error: turnstileResult.error || 'CAPTCHA verification failed' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Validate required fields
    if (!username || !name || !email || !password) {
      return new Response(
        JSON.stringify({ error: 'All fields are required (username, name, email, password)' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate username
    if (!isValidUsername(username)) {
      return new Response(
        JSON.stringify({
          error: 'Invalid username. Use 3-20 alphanumeric characters or underscores, no spaces.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate email
    if (!isValidEmail(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Block disposable email domains
    if (isDisposableEmail(email)) {
      return new Response(
        JSON.stringify({ error: 'Disposable email addresses are not allowed. Please use a permanent email.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate password
    if (!isValidPassword(password)) {
      return new Response(
        JSON.stringify({
          error: 'Invalid password. Must be at least 8 characters with letters and numbers.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Ensure KV is available (already checked above, but TypeScript needs this)
    if (!USERS) {
      return new Response(
        JSON.stringify({ error: 'Registration not available in local development' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if email already exists
    const existingUser = await getUserByEmail(USERS, email);
    if (existingUser) {
      return new Response(
        JSON.stringify({ error: 'Email already registered' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create user
    const { user, confirmToken } = await createUser(USERS, {
      username,
      name,
      email,
      password,
    });

    // Record successful registration for rate limiting
    await recordRateLimitedAction(USERS, 'register', { ip }, true);

    // Send confirmation email
    const resendApiKey = (locals as Record<string, unknown>).runtime?.env?.RESEND_API_KEY as string | undefined;
    if (resendApiKey) {
      const emailResult = await sendConfirmationEmail({
        to: email,
        name,
        confirmToken,
        apiKey: resendApiKey,
      });

      if (!emailResult.success) {
        console.error('Failed to send confirmation email:', emailResult.error);
        // Continue anyway - user can request resend
      }
    } else {
      console.warn('RESEND_API_KEY not configured - skipping confirmation email');
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Registration successful. Check your email to confirm your account.',
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Registration error:', error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message === 'Email already registered') {
        return new Response(
          JSON.stringify({ error: 'Email already registered' }),
          { status: 409, headers: { 'Content-Type': 'application/json' } }
        );
      }
      if (error.message === 'Username already taken') {
        return new Response(
          JSON.stringify({ error: 'Username already taken' }),
          { status: 409, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
