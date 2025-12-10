/**
 * POST /api/auth/login
 *
 * Validates credentials against KV and creates a session.
 */
import type { APIRoute } from 'astro';
import {
  validateCredentials,
  createSession,
  createSessionCookie,
  sanitizeUser,
} from '../../../lib/auth/kv-auth';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { USERS, SESSIONS } = locals.runtime.env;

    // Parse request body
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate credentials
    const user = await validateCredentials(USERS, email, password);

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Invalid email or password' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create session
    const { token, expiresAt } = await createSession(SESSIONS, user.id);

    // Return user data with session cookie
    return new Response(
      JSON.stringify({
        success: true,
        user: sanitizeUser(user),
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': createSessionCookie(token, expiresAt),
        },
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
