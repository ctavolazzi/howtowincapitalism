/**
 * Reset Password API Endpoint
 *
 * Validates reset token and updates user's password.
 * Tokens are one-time use and deleted after successful reset.
 */

import type { APIRoute } from 'astro';
import { getUserById, hashPasswordV2 } from '../../../lib/auth/kv-auth';
import { sendPasswordChangedEmail } from '../../../lib/email/send-reset';
import { validateCSRFToken, getRequestMetadata } from '../../../lib/auth/csrf';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const { token, password, csrf_token } = body;

    if (!token || !password) {
      return new Response(
        JSON.stringify({ error: 'Token and password are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 8 characters' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate CSRF token (only in production with CSRF_SECRET)
    const csrfSecret = (locals as Record<string, unknown>).runtime?.env?.CSRF_SECRET;
    if (csrfSecret) {
      if (!csrf_token) {
        return new Response(
          JSON.stringify({ error: 'CSRF token required' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const { ip, country, userAgent } = getRequestMetadata(request);
      const csrfResult = await validateCSRFToken(csrf_token, csrfSecret, ip, country, userAgent);
      if (!csrfResult.valid) {
        console.warn('CSRF validation failed:', csrfResult.error);
        return new Response(
          JSON.stringify({ error: 'Invalid CSRF token' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Check for KV availability
    const USERS = (locals as Record<string, unknown>).runtime?.env?.USERS as KVNamespace | undefined;
    const RESEND_API_KEY = (locals as Record<string, unknown>).runtime?.env?.RESEND_API_KEY as string | undefined;

    if (!USERS) {
      return new Response(
        JSON.stringify({ error: 'Service unavailable' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Look up user by reset token
    const userId = await USERS.get(`reset:${token}`);
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired reset token' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get user
    const user = await getUserById(USERS, userId);
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Hash new password with V2 (PBKDF2)
    const newPasswordHash = await hashPasswordV2(password);

    // Update user's password
    user.passwordHash = newPasswordHash;
    await USERS.put(`user:${user.id}`, JSON.stringify(user));

    // Delete the reset token (one-time use)
    await USERS.delete(`reset:${token}`);

    // Send confirmation email
    if (RESEND_API_KEY) {
      await sendPasswordChangedEmail({
        to: user.email,
        name: user.name,
        apiKey: RESEND_API_KEY,
      });
    }

    return new Response(
      JSON.stringify({
        message: 'Password reset successful! You can now log in with your new password.',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
