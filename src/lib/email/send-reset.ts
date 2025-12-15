/**
 * @fileoverview Password Reset & Changed Email Sender
 *
 * Comprehensive password email module with two functions:
 * 1. sendPasswordResetEmail - Sends reset link
 * 2. sendPasswordChangedEmail - Confirms password was changed
 *
 * Uses modern HTML email design with gradient headers and responsive layout.
 *
 * @module lib/email/send-reset
 * @see {@link module:pages/api/auth/forgot-password} - Triggers reset email
 * @see {@link module:pages/api/auth/reset-password} - Triggers changed email
 * @see {@link https://resend.com/docs} - Resend API documentation
 *
 * ## Configuration
 *
 * | Constant | Value | Description |
 * |----------|-------|-------------|
 * | SITE_URL | https://howtowincapitalism.com | Base URL for links |
 * | FROM_EMAIL | noreply@howtowincapitalism.com | Sender address |
 *
 * ## Exported Functions
 *
 * ### sendPasswordResetEmail
 *
 * Sends password reset link with 2-hour expiration.
 *
 * ```typescript
 * await sendPasswordResetEmail({
 *   to: 'user@example.com',
 *   name: 'John Doe',
 *   resetToken: 'abc123...',
 *   apiKey: 're_xxx',
 * });
 * ```
 *
 * ### sendPasswordChangedEmail
 *
 * Confirms password change with security warning.
 *
 * ```typescript
 * await sendPasswordChangedEmail({
 *   to: 'user@example.com',
 *   name: 'John Doe',
 *   apiKey: 're_xxx',
 * });
 * ```
 *
 * ## Email Design
 *
 * - Gradient header (blue tones)
 * - Responsive table-based layout
 * - CTA buttons with hover states
 * - Security warnings with left border
 *
 * @author How To Win Capitalism Team
 * @since 1.0.0
 */

import { Resend } from 'resend';

const SITE_URL = 'https://howtowincapitalism.com';
const FROM_EMAIL = 'noreply@howtowincapitalism.com';

interface SendResetParams {
  to: string;
  name: string;
  resetToken: string;
  apiKey: string;
}

interface SendPasswordChangedParams {
  to: string;
  name: string;
  apiKey: string;
}

/**
 * Send a password reset email
 */
export async function sendPasswordResetEmail({
  to,
  name,
  resetToken,
  apiKey,
}: SendResetParams): Promise<{ success: boolean; error?: string }> {
  const resend = new Resend(apiKey);

  const resetUrl = `${SITE_URL}/reset-password/?token=${resetToken}`;
  const firstName = name.split(' ')[0];

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: 'Reset Your Password - How To Win Capitalism',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2c5282 0%, #2b6cb0 100%); padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                How To Win Capitalism
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #1a202c; font-size: 20px; font-weight: 600;">
                Password Reset Request
              </h2>

              <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Hi ${firstName},
              </p>

              <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                We received a request to reset your password. Click the button below to create a new password:
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 30px 0;">
                <tr>
                  <td style="border-radius: 6px; background: linear-gradient(135deg, #2c5282 0%, #2b6cb0 100%);">
                    <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 20px 0; color: #718096; font-size: 14px; line-height: 1.6;">
                This link will expire in <strong>2 hours</strong>.
              </p>

              <p style="margin: 0 0 20px 0; color: #718096; font-size: 14px; line-height: 1.6;">
                If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>

              <!-- Alternative Link -->
              <p style="margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 12px; line-height: 1.6;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color: #2b6cb0; word-break: break-all;">${resetUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f7fafc; padding: 20px 40px; text-align: center;">
              <p style="margin: 0; color: #718096; font-size: 12px;">
                &copy; ${new Date().getFullYear()} How To Win Capitalism. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
      text: `
Hi ${firstName},

We received a request to reset your password for your How To Win Capitalism account.

Click the link below to create a new password:
${resetUrl}

This link will expire in 2 hours.

If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.

---
How To Win Capitalism
      `.trim(),
    });

    if (error) {
      console.error('Failed to send password reset email:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send a password changed confirmation email
 */
export async function sendPasswordChangedEmail({
  to,
  name,
  apiKey,
}: SendPasswordChangedParams): Promise<{ success: boolean; error?: string }> {
  const resend = new Resend(apiKey);

  const firstName = name.split(' ')[0];
  const loginUrl = `${SITE_URL}/login/`;

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: 'Your Password Has Been Changed - How To Win Capitalism',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Changed</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2c5282 0%, #2b6cb0 100%); padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                How To Win Capitalism
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #1a202c; font-size: 20px; font-weight: 600;">
                Password Changed Successfully
              </h2>

              <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Hi ${firstName},
              </p>

              <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Your password has been successfully changed. You can now log in with your new password.
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 30px 0;">
                <tr>
                  <td style="border-radius: 6px; background: linear-gradient(135deg, #2c5282 0%, #2b6cb0 100%);">
                    <a href="${loginUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">
                      Log In Now
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0 0; padding: 20px; background-color: #fff5f5; border-left: 4px solid #fc8181; color: #c53030; font-size: 14px; line-height: 1.6;">
                <strong>Didn't make this change?</strong><br>
                If you didn't change your password, please contact us immediately as your account may have been compromised.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f7fafc; padding: 20px 40px; text-align: center;">
              <p style="margin: 0; color: #718096; font-size: 12px;">
                &copy; ${new Date().getFullYear()} How To Win Capitalism. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
      text: `
Hi ${firstName},

Your password has been successfully changed. You can now log in with your new password.

Log in at: ${loginUrl}

If you didn't make this change, please contact us immediately as your account may have been compromised.

---
How To Win Capitalism
      `.trim(),
    });

    if (error) {
      console.error('Failed to send password changed email:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending password changed email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
