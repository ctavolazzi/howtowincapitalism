/**
 * POST /api/auth/logout
 *
 * Deletes session and clears cookie.
 */
import type { APIRoute } from 'astro';
import {
  parseSessionCookie,
  deleteSession,
  createLogoutCookie,
} from '../../../lib/auth/kv-auth';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { SESSIONS } = locals.runtime.env;

    // Get session token from cookie
    const cookieHeader = request.headers.get('cookie');
    const token = parseSessionCookie(cookieHeader);

    // Delete session if exists
    if (token) {
      await deleteSession(SESSIONS, token);
    }

    // Return success with cleared cookie
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
  } catch (error) {
    console.error('Logout error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
