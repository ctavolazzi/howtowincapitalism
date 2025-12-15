/**
 * @fileoverview POST /api/auth/reset-password - Password reset completion.
 *
 * Resets password using a valid reset token from email.
 * Validates password strength requirements.
 *
 * @module pages/api/auth/reset-password
 * @see {@link module:lib/auth/kv-auth} - Password reset logic
 * @see {@link module:pages/api/auth/forgot-password} - Reset request
 *
 * @author How To Win Capitalism Team
 * @since 1.0.0
 */
import type { APIRoute } from 'astro';
import { resetPassword, validateResetToken } from '../../../lib/auth/kv-auth';

// Password validation
function isValidPassword(password: string): boolean {
  // At least 8 chars, with at least one letter and one number
  return password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Reset token is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!password) {
      return new Response(
        JSON.stringify({ error: 'Password is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

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
        JSON.stringify({ error: 'Password reset not available in local development' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { USERS } = locals.runtime.env;

    // Reset password
    const success = await resetPassword(USERS, token, password);

    if (!success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid or expired reset link. Please request a new password reset.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Password reset successful. You can now log in with your new password.',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * GET /api/auth/reset-password?token=xxx
 *
 * Validates a reset token without using it.
 * Used to check if token is valid before showing reset form.
 */
export const GET: APIRoute = async ({ url, locals }) => {
  const token = url.searchParams.get('token');

  if (!token) {
    return new Response(
      JSON.stringify({ valid: false, error: 'Token is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Check if KV is available
  const hasKV = locals.runtime?.env?.USERS;
  if (!hasKV) {
    return new Response(
      JSON.stringify({ valid: false, error: 'Service unavailable' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { USERS } = locals.runtime.env;

  const result = await validateResetToken(USERS, token);

  if (!result) {
    return new Response(
      JSON.stringify({ valid: false, error: 'Invalid or expired token' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ valid: true, email: result.email }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
