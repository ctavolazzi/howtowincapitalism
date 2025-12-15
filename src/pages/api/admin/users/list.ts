/**
 * @fileoverview Admin User List API Endpoint
 *
 * Lists all users in the system with admin-level access control.
 * Returns sanitized user data (no password hashes or sensitive info).
 *
 * @module pages/api/admin/users/list
 * @see {@link module:lib/auth/kv-auth} - User retrieval and sanitization
 * @see {@link module:pages/api/admin/users/create} - Create user
 * @see {@link module:pages/api/admin/users/[id]} - Individual user operations
 *
 * ## Endpoint
 *
 * `GET /api/admin/users/list`
 *
 * ## Authentication
 *
 * Requires valid session cookie with `role: 'admin'`.
 *
 * ## Response
 *
 * **Success (200):**
 * ```json
 * {
 *   "success": true,
 *   "users": [
 *     { "id": "...", "email": "...", "name": "...", "role": "...", ... }
 *   ],
 *   "total": 42
 * }
 * ```
 *
 * **Error Responses:**
 *
 * | Status | Error | Cause |
 * |--------|-------|-------|
 * | 403 | Unauthorized | Not logged in or not admin |
 * | 503 | Service unavailable | KV not available |
 * | 500 | Internal server error | Unexpected error |
 *
 * ## Implementation Notes
 *
 * - Users are sorted by creation date (newest first)
 * - Password hashes are stripped via `sanitizeUser()`
 * - Total count uses `count:users` KV key if available
 * - Uses KV `list()` with `user:` prefix to enumerate users
 *
 * @author How To Win Capitalism Team
 * @since 1.0.0
 */
import type { APIRoute } from 'astro';
import { getCurrentUser, sanitizeUser, type KVUser } from '../../../../lib/auth/kv-auth';

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    // Check if KV is available
    const USERS = (locals as Record<string, unknown>).runtime?.env?.USERS as KVNamespace | undefined;
    const SESSIONS = (locals as Record<string, unknown>).runtime?.env?.SESSIONS as KVNamespace | undefined;

    if (!USERS || !SESSIONS) {
      return new Response(
        JSON.stringify({ error: 'Service unavailable' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify admin session
    const cookieHeader = request.headers.get('cookie');
    const currentUser = await getCurrentUser(USERS, SESSIONS, cookieHeader);

    if (!currentUser || currentUser.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Unauthorized. Admin access required.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // List all user keys
    const listResult = await USERS.list({ prefix: 'user:' });

    // Fetch all users
    const users: ReturnType<typeof sanitizeUser>[] = [];
    for (const key of listResult.keys) {
      const userData = await USERS.get(key.name);
      if (userData) {
        const user: KVUser = JSON.parse(userData);
        users.push(sanitizeUser(user));
      }
    }

    // Sort by creation date (newest first)
    users.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    // Get total count
    const countData = await USERS.get('count:users');
    const totalCount = countData ? parseInt(countData, 10) : users.length;

    return new Response(
      JSON.stringify({
        success: true,
        users,
        total: totalCount,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Admin list users error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
