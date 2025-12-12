/**
 * POST /api/auth/register
 *
 * Creates a new user account and sends confirmation email.
 */
import type { APIRoute } from 'astro';
import { createUser, getUserByEmail } from '../../../lib/auth/kv-auth';
import { sendConfirmationEmail } from '../../../lib/email/send-confirmation';

// Validation helpers
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUsername(username: string): boolean {
  // Alphanumeric, underscores, 3-20 chars, no spaces
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

function isValidPassword(password: string): boolean {
  // At least 8 chars, with at least one letter and one number
  return password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const { username, name, email, password } = body;

    // Validate required fields
    if (!username || !name || !email || !password) {
      return new Response(
        JSON.stringify({ error: 'All fields are required (username, name, email, password)' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate username
    if (!isValidUsername(username)) {
      return new Response(
        JSON.stringify({
          error: 'Invalid username. Use 3-20 alphanumeric characters or underscores, no spaces.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate email
    if (!isValidEmail(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate password
    if (!isValidPassword(password)) {
      return new Response(
        JSON.stringify({
          error: 'Invalid password. Must be at least 8 characters with letters and numbers.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if KV is available
    const hasKV = locals.runtime?.env?.USERS;
    if (!hasKV) {
      return new Response(
        JSON.stringify({ error: 'Registration not available in local development' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { USERS } = locals.runtime.env;

    // Check if email already exists
    const existingUser = await getUserByEmail(USERS, email);
    if (existingUser) {
      return new Response(
        JSON.stringify({ error: 'Email already registered' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create user
    const { user, confirmToken } = await createUser(USERS, {
      username,
      name,
      email,
      password,
    });

    // Send confirmation email
    const resendApiKey = locals.runtime?.env?.RESEND_API_KEY;
    if (resendApiKey) {
      const emailResult = await sendConfirmationEmail({
        to: email,
        name,
        confirmToken,
        apiKey: resendApiKey,
      });

      if (!emailResult.success) {
        console.error('Failed to send confirmation email:', emailResult.error);
        // Continue anyway - user can request resend
      }
    } else {
      console.warn('RESEND_API_KEY not configured - skipping confirmation email');
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Registration successful. Check your email to confirm your account.',
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Registration error:', error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message === 'Email already registered') {
        return new Response(
          JSON.stringify({ error: 'Email already registered' }),
          { status: 409, headers: { 'Content-Type': 'application/json' } }
        );
      }
      if (error.message === 'Username already taken') {
        return new Response(
          JSON.stringify({ error: 'Username already taken' }),
          { status: 409, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
