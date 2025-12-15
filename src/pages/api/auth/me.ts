/**
 * @fileoverview GET /api/auth/me - Current user info endpoint.
 *
 * Returns current authenticated user from session cookie.
 * Returns null/401 if not authenticated.
 *
 * @module pages/api/auth/me
 * @see {@link module:lib/auth/kv-auth} - KV user retrieval
 * @see {@link module:lib/auth/local-auth} - Local dev retrieval
 *
 * @author How To Win Capitalism Team
 * @since 1.0.0
 */
import type { APIRoute } from 'astro';
import { getCurrentUser, sanitizeUser } from '../../../lib/auth/kv-auth';
import {
  parseSessionCookieLocal,
  getSessionLocal,
  getUserByIdLocal,
} from '../../../lib/auth/local-auth';

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const cookieHeader = request.headers.get('cookie');
    const hasKV = locals.runtime?.env?.USERS && locals.runtime?.env?.SESSIONS;

    if (hasKV) {
      // Production: Use Cloudflare KV
      const { USERS, SESSIONS } = locals.runtime.env;
      const user = await getCurrentUser(USERS, SESSIONS, cookieHeader);

      if (!user) {
        return new Response(
          JSON.stringify({ authenticated: false, user: null }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ authenticated: true, user: sanitizeUser(user) }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      // Local dev: Use in-memory
      const token = parseSessionCookieLocal(cookieHeader);

      if (!token) {
        return new Response(
          JSON.stringify({ authenticated: false, user: null }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const session = getSessionLocal(token);
      if (!session) {
        return new Response(
          JSON.stringify({ authenticated: false, user: null }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const user = getUserByIdLocal(session.userId);
      if (!user) {
        return new Response(
          JSON.stringify({ authenticated: false, user: null }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ authenticated: true, user }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Auth check error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
