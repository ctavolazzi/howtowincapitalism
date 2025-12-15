/**
 * @fileoverview Email confirmation sender using Resend API.
 *
 * Sends confirmation emails to new users after registration.
 * Uses Resend service for reliable email delivery.
 *
 * @module lib/email/send-confirmation
 * @see {@link module:pages/api/auth/register} - Registration endpoint
 * @see {@link module:pages/api/auth/confirm} - Confirmation handler
 *
 * @example
 * ```typescript
 * import { sendConfirmationEmail } from '../lib/email/send-confirmation';
 *
 * await sendConfirmationEmail({
 *   to: user.email,
 *   name: user.name,
 *   confirmToken: token,
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

interface SendConfirmationParams {
  to: string;
  name: string;
  confirmToken: string;
  apiKey: string;
}

export async function sendConfirmationEmail({
  to,
  name,
  confirmToken,
  apiKey,
}: SendConfirmationParams): Promise<{ success: boolean; error?: string }> {
  const resend = new Resend(apiKey);

  const confirmUrl = `${SITE_URL}/api/auth/confirm/?token=${confirmToken}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Your Email</title>
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
  </style>
</head>
<body>
  <div class="container">
    <h1>Welcome, ${name}!</h1>

    <p>Thanks for registering at How To Win Capitalism. To complete your registration, please confirm your email address.</p>

    <p style="text-align: center;">
      <a href="${confirmUrl}" class="button">Confirm Email Address</a>
    </p>

    <p>Or copy and paste this link into your browser:</p>
    <p><a href="${confirmUrl}" class="link">${confirmUrl}</a></p>

    <p>This link will expire in 24 hours.</p>

    <div class="footer">
      <p>If you didn't create an account, you can safely ignore this email.</p>
      <p>— How To Win Capitalism</p>
    </div>
  </div>
</body>
</html>
`;

  const text = `
Welcome, ${name}!

Thanks for registering at How To Win Capitalism. To complete your registration, please confirm your email address.

Click here to confirm: ${confirmUrl}

This link will expire in 24 hours.

If you didn't create an account, you can safely ignore this email.

— How To Win Capitalism
`;

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Confirm your How To Win Capitalism account',
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
