/**
 * @fileoverview Forgot Password API Endpoint
 *
 * Initiates password reset flow by sending a reset email.
 * Always returns success to prevent email enumeration attacks.
 *
 * @module pages/api/auth/forgot-password
 * @see {@link module:lib/auth/kv-auth} - Reset token creation
 * @see {@link module:lib/email/send-password-reset} - Email sending
 *
 * ## Endpoint
 *
 * `POST /api/auth/forgot-password`
 *
 * ## Request Body
 *
 * ```json
 * { "email": "user@example.com" }
 * ```
 *
 * ## Response
 *
 * **Always (200):**
 * ```json
 * { "success": true, "message": "If account exists, email sent" }
 * ```
 *
 * ## Security Notes
 *
 * - Always returns success (prevents email enumeration)
 * - Reset tokens expire after 1 hour
 * - Tokens are one-time use
 * - Requires KV (production only)
 *
 * @author How To Win Capitalism Team
 * @since 1.0.0
 */
import type { APIRoute } from 'astro';
import { createPasswordReset } from '../../../lib/auth/kv-auth';
import { sendPasswordResetEmail } from '../../../lib/email/send-password-reset';

// Simple email validation
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!isValidEmail(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
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

    // Create password reset request
    const result = await createPasswordReset(USERS, email.toLowerCase());

    // If user exists, send email
    if (result) {
      const resendApiKey = locals.runtime?.env?.RESEND_API_KEY;
      if (resendApiKey) {
        const emailResult = await sendPasswordResetEmail({
          to: result.user.email,
          name: result.user.name,
          resetToken: result.resetToken,
          apiKey: resendApiKey,
        });

        if (!emailResult.success) {
          console.error('Failed to send password reset email:', emailResult.error);
          // Don't reveal this to the user
        }
      } else {
        console.warn('RESEND_API_KEY not configured - skipping password reset email');
      }
    }

    // Always return success to prevent email enumeration
    // Don't reveal whether the email exists or not
    return new Response(
      JSON.stringify({
        success: true,
        message: 'If an account exists with that email, you will receive a password reset link.',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
