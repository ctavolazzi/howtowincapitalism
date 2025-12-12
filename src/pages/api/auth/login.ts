/**
 * POST /api/auth/login
 *
 * Validates credentials against KV (production) or mock data (local dev).
 */
import type { APIRoute } from 'astro';
import {
  validateCredentials,
  createSession,
  createSessionCookie,
  sanitizeUser,
} from '../../../lib/auth/kv-auth';
import {
  validateCredentialsLocal,
  createSessionLocal,
  createSessionCookieLocal,
} from '../../../lib/auth/local-auth';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse request body
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if KV is available (production) or use local fallback (dev)
    const hasKV = locals.runtime?.env?.USERS && locals.runtime?.env?.SESSIONS;

    if (hasKV) {
      // Production: Use Cloudflare KV
      const { USERS, SESSIONS } = locals.runtime.env;

      const user = await validateCredentials(USERS, email, password);

      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Invalid email or password' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
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
