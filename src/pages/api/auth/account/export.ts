/**
 * @fileoverview Account Data Export API Endpoint
 *
 * Returns a JSON export of the authenticated user's account data.
 * Implements GDPR "right to data portability".
 *
 * @module pages/api/auth/account/export
 * @see {@link module:lib/auth/kv-auth} - User data retrieval
 * @see {@link module:pages/api/auth/account/delete} - Account deletion
 *
 * ## Endpoint
 *
 * `GET /api/auth/account/export`
 *
 * ## Request
 *
 * Requires authenticated session (cookie).
 *
 * ## Response
 *
 * **Success (200):**
 * ```json
 * {
 *   "exportDate": "2025-01-01T00:00:00.000Z",
 *   "user": {
 *     "id", "email", "name", "role", "accessLevel",
 *     "avatar", "bio", "createdAt", "emailConfirmed"
 *   }
 * }
 * ```
 * + `Content-Disposition: attachment; filename="account-export.json"`
 *
 * **Error (401/503):**
 * ```json
 * { "error": "Not authenticated" | "Not available in dev mode" }
 * ```
 *
 * ## Excluded Data
 *
 * - Password hash (security)
 * - Session tokens (security)
 * - Confirmation tokens (expired)
 *
 * @author How To Win Capitalism Team
 * @since 1.0.0
 */
import type { APIRoute } from 'astro';
import { getCurrentUser, sanitizeUser } from '../../../../lib/auth/kv-auth';

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const USERS = (locals as Record<string, unknown>).runtime?.env?.USERS as KVNamespace | undefined;
    const SESSIONS = (locals as Record<string, unknown>).runtime?.env?.SESSIONS as KVNamespace | undefined;

    if (!USERS || !SESSIONS) {
      return new Response(
        JSON.stringify({ error: 'Account export requires production environment' }),
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

    const exportPayload = {
      user: sanitizeUser(currentUser),
      metadata: {
        exportedAt: new Date().toISOString(),
      },
    };

    return new Response(JSON.stringify({ success: true, data: exportPayload }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Account export error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
