/**
 * GET /api/auth/me
 *
 * Returns current user from session cookie.
 */
import type { APIRoute } from 'astro';
import { getCurrentUser, sanitizeUser } from '../../../lib/auth/kv-auth';

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const { USERS, SESSIONS } = locals.runtime.env;

    // Get current user from cookie
    const cookieHeader = request.headers.get('cookie');
    const user = await getCurrentUser(USERS, SESSIONS, cookieHeader);

    if (!user) {
      return new Response(
        JSON.stringify({ authenticated: false, user: null }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        authenticated: true,
        user: sanitizeUser(user),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Auth check error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
