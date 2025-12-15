/**
 * @fileoverview Logout API Endpoint
 *
 * Terminates user session by deleting the session from KV/memory
 * and clearing the session cookie.
 *
 * @module pages/api/auth/logout
 * @see {@link module:lib/auth/kv-auth} - Session deletion
 * @see {@link module:lib/auth/local-auth} - Local session deletion
 *
 * ## Endpoint
 *
 * `POST /api/auth/logout`
 *
 * ## Request
 *
 * No body required. Session identified by `htwc_session` cookie.
 *
 * ## Response
 *
 * **Success (200):**
 * ```json
 * { "success": true }
 * ```
 * + `Set-Cookie: htwc_session=; Expires=Thu, 01 Jan 1970...`
 *
 * **Error (500):**
 * ```json
 * { "error": "Logout failed" }
 * ```
 *
 * @author How To Win Capitalism Team
 * @since 1.0.0
 */
import type { APIRoute } from 'astro';
import {
  parseSessionCookie,
  deleteSession,
  createLogoutCookie,
} from '../../../lib/auth/kv-auth';
import {
  parseSessionCookieLocal,
  deleteSessionLocal,
  createLogoutCookieLocal,
} from '../../../lib/auth/local-auth';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const cookieHeader = request.headers.get('cookie');
    const hasKV = locals.runtime?.env?.SESSIONS;

    if (hasKV) {
      // Production: Use Cloudflare KV
      const { SESSIONS } = locals.runtime.env;
      const token = parseSessionCookie(cookieHeader);

      if (token) {
        await deleteSession(SESSIONS, token);
      }

      return new Response(
        JSON.stringify({ success: true }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': createLogoutCookie(),
          },
        }
      );
    } else {
      // Local dev: Use in-memory
      const token = parseSessionCookieLocal(cookieHeader);

      if (token) {
        deleteSessionLocal(token);
      }

      return new Response(
        JSON.stringify({ success: true }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': createLogoutCookieLocal(),
          },
        }
      );
    }
  } catch (error) {
    console.error('Logout error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
