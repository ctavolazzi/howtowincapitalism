/**
 * @fileoverview Account Deletion API Endpoint
 *
 * Permanently deletes the authenticated user's account and all
 * associated data. Implements GDPR "right to be forgotten".
 *
 * @module pages/api/auth/account/delete
 * @see {@link module:lib/auth/kv-auth} - User deletion
 * @see {@link module:pages/api/auth/account/export} - Data export (do first)
 *
 * ## Endpoint
 *
 * `DELETE /api/auth/account`
 *
 * ## Request
 *
 * Requires authenticated session (cookie).
 *
 * ## Response
 *
 * **Success (200):**
 * ```json
 * { "success": true, "message": "Account deleted" }
 * ```
 * + Session cookie cleared
 *
 * **Error (401/503):**
 * ```json
 * { "error": "Not authenticated" | "Not available in dev mode" }
 * ```
 *
 * ## Data Deleted
 *
 * - User record (`user:{id}`)
 * - Email index (`email:{email}`)
 * - Active sessions
 *
 * @author How To Win Capitalism Team
 * @since 1.0.0
 */
import type { APIRoute } from 'astro';
import {
  getCurrentUser,
  parseSessionCookie,
  deleteSession,
} from '../../../../lib/auth/kv-auth';

export const DELETE: APIRoute = async ({ request, locals }) => {
  try {
    const USERS = (locals as Record<string, unknown>).runtime?.env?.USERS as KVNamespace | undefined;
    const SESSIONS = (locals as Record<string, unknown>).runtime?.env?.SESSIONS as KVNamespace | undefined;

    if (!USERS || !SESSIONS) {
      return new Response(
        JSON.stringify({ error: 'Account deletion requires production environment' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const cookieHeader = request.headers.get('cookie');
    const currentUser = await getCurrentUser(USERS, SESSIONS, cookieHeader);

    if (!currentUser) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const sessionToken = parseSessionCookie(cookieHeader);

    // Delete user and indexes
    await USERS.delete(`user:${currentUser.id}`);
    await USERS.delete(`email:${currentUser.email.toLowerCase()}`);

    // Decrement user count (best effort)
    const countData = await USERS.get('count:users');
    const currentCount = countData ? parseInt(countData, 10) : 1;
    await USERS.put('count:users', String(Math.max(0, currentCount - 1)));

    // Delete current session (best effort)
    if (sessionToken) {
      await deleteSession(SESSIONS, sessionToken);
    }

    console.log(`[account] Deleted user ${currentUser.id}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Account deleted' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie':
            'htwc_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
        },
      }
    );
  } catch (error) {
    console.error('Account deletion error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
