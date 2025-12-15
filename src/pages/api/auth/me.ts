/**
 * @fileoverview Current User API Endpoint
 *
 * Returns the currently authenticated user's profile data based on
 * the session cookie. Used by client-side auth checks.
 *
 * @module pages/api/auth/me
 * @see {@link module:lib/auth/kv-auth} - KV user lookup
 * @see {@link module:lib/auth/api-client} - Client-side usage
 *
 * ## Endpoint
 *
 * `GET /api/auth/me`
 *
 * ## Request
 *
 * No body. Requires `htwc_session` cookie.
 *
 * ## Response
 *
 * **Authenticated (200):**
 * ```json
 * {
 *   "authenticated": true,
 *   "user": {
 *     "id": "username",
 *     "email": "user@example.com",
 *     "name": "Display Name",
 *     "role": "admin|editor|contributor|viewer",
 *     "accessLevel": 1-10,
 *     "avatar": "/path/to/avatar",
 *     "bio": "User bio"
 *   }
 * }
 * ```
 *
 * **Not Authenticated (200):**
 * ```json
 * { "authenticated": false, "user": null }
 * ```
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
