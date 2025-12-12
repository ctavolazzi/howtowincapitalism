/**
 * Forgot Password API Endpoint
 *
 * Generates a password reset token and sends email.
 * Returns ambiguous response regardless of email existence (security).
 */

import type { APIRoute } from 'astro';
import { getUserByEmail } from '../../../lib/auth/kv-auth';
import { sendPasswordResetEmail } from '../../../lib/email/send-reset';
import { validateCSRFToken, getRequestMetadata } from '../../../lib/auth/csrf';

// Reset token expiry: 2 hours
const RESET_TOKEN_TTL_SECONDS = 2 * 60 * 60;

/**
 * Generate a secure random token
 */
function generateResetToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const { email, csrf_token } = body;

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

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Always return success message (security: don't reveal if email exists)
    const ambiguousResponse = new Response(
      JSON.stringify({
        message: 'If an account exists with that email, you will receive a reset link shortly.',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

    // Check for KV availability
    const USERS = (locals as Record<string, unknown>).runtime?.env?.USERS as KVNamespace | undefined;
    const RESEND_API_KEY = (locals as Record<string, unknown>).runtime?.env?.RESEND_API_KEY as string | undefined;

    if (!USERS || !RESEND_API_KEY) {
      console.warn('KV or Resend not configured, skipping password reset');
      return ambiguousResponse;
    }

    // Look up user by email
    const user = await getUserByEmail(USERS, email);
    if (!user) {
      // Don't reveal that email doesn't exist
      return ambiguousResponse;
    }

    // Generate reset token
    const resetToken = generateResetToken();

    // Store reset token in KV with TTL
    await USERS.put(`reset:${resetToken}`, user.id, {
      expirationTtl: RESET_TOKEN_TTL_SECONDS,
    });

    // Send reset email
    const emailResult = await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetToken,
      apiKey: RESEND_API_KEY,
    });

    if (!emailResult.success) {
      console.error('Failed to send reset email:', emailResult.error);
      // Still return ambiguous response
    }

    return ambiguousResponse;
  } catch (error) {
    console.error('Forgot password error:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
