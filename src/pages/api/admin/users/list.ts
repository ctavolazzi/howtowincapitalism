/**
 * GET /api/admin/users/list
 *
 * Admin endpoint to list all users.
 * Returns sanitized user data (no password hashes).
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
