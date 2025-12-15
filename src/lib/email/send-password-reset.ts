/**
 * @fileoverview Password reset email sender using Resend API.
 *
 * Sends password reset emails when users request to reset.
 * Uses Resend service for reliable email delivery.
 *
 * @module lib/email/send-password-reset
 * @see {@link module:pages/api/auth/forgot-password} - Request handler
 * @see {@link module:pages/api/auth/reset-password} - Reset handler
 *
 * @example
 * ```typescript
 * import { sendPasswordResetEmail } from '../lib/email/send-password-reset';
 *
 * await sendPasswordResetEmail({
 *   to: user.email,
 *   name: user.name,
 *   resetToken: token,
 *   apiKey: env.RESEND_API_KEY,
 * });
 * ```
 *
 * @author How To Win Capitalism Team
 * @since 1.0.0
 */

import { Resend } from 'resend';

const SITE_URL = 'https://howtowincapitalism.com';
const FROM_EMAIL = 'noreply@howtowincapitalism.com';

interface SendPasswordResetParams {
  to: string;
  name: string;
  resetToken: string;
  apiKey: string;
}

export async function sendPasswordResetEmail({
  to,
  name,
  resetToken,
  apiKey,
}: SendPasswordResetParams): Promise<{ success: boolean; error?: string }> {
  const resend = new Resend(apiKey);

  const resetUrl = `${SITE_URL}/reset-password/?token=${resetToken}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #202122;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background: #f8f9fa;
      border: 1px solid #a2a9b1;
      padding: 30px;
    }
    h1 {
      color: #202122;
      margin-top: 0;
    }
    .button {
      display: inline-block;
      background: #0645ad;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 24px;
      font-size: 16px;
      font-weight: bold;
      margin: 20px 0;
    }
    .button:hover {
      background: #0b0080;
    }
    .link {
      color: #0645ad;
      word-break: break-all;
    }
    .footer {
      margin-top: 30px;
      font-size: 14px;
      color: #666;
    }
    .warning {
      background: #fff3cd;
      border: 1px solid #ffc107;
      padding: 12px;
      margin: 20px 0;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Password Reset Request</h1>

    <p>Hi ${name},</p>

    <p>We received a request to reset your password for your How To Win Capitalism account. Click the button below to set a new password:</p>

    <p style="text-align: center;">
      <a href="${resetUrl}" class="button">Reset Password</a>
    </p>

    <p>Or copy and paste this link into your browser:</p>
    <p><a href="${resetUrl}" class="link">${resetUrl}</a></p>

    <div class="warning">
      ⚠️ This link will expire in 1 hour for security reasons.
    </div>

    <div class="footer">
      <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
      <p>— How To Win Capitalism</p>
    </div>
  </div>
</body>
</html>
`;

  const text = `
Password Reset Request

Hi ${name},

We received a request to reset your password for your How To Win Capitalism account.

Click here to reset your password: ${resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.

— How To Win Capitalism
`;

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Reset your How To Win Capitalism password',
      html,
      text,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Email send error:', err);
    return { success: false, error: String(err) };
  }
}
