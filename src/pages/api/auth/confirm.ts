/**
 * @fileoverview Email Confirmation API Endpoint
 *
 * Confirms a user's email address using a token sent via email.
 * Redirects to success or error page based on validation result.
 *
 * @module pages/api/auth/confirm
 * @see {@link module:lib/auth/kv-auth} - Token validation
 * @see {@link module:pages/confirm/success} - Success page
 * @see {@link module:pages/confirm/error} - Error page
 *
 * ## Endpoint
 *
 * `GET /api/auth/confirm?token=...`
 *
 * ## Query Parameters
 *
 * | Param | Required | Description |
 * |-------|----------|-------------|
 * | token | Yes | 64-char hex confirmation token |
 *
 * ## Response
 *
 * Redirects to:
 * - `/confirm/success/` - Token valid, email confirmed
 * - `/confirm/error/?reason=...` - Token invalid/expired
 *
 * ## Error Reasons
 *
 * - `missing-token` - No token provided
 * - `invalid-token` - Token not found or expired
 * - `server-error` - KV not available
 *
 * @author How To Win Capitalism Team
 * @since 1.0.0
 */
import type { APIRoute } from 'astro';
import { confirmEmail } from '../../../lib/auth/kv-auth';

export const GET: APIRoute = async ({ url, locals, redirect }) => {
  const token = url.searchParams.get('token');

  if (!token) {
    return redirect('/confirm/error/?reason=missing-token');
  }

  // Check if KV is available
  const hasKV = locals.runtime?.env?.USERS;
  if (!hasKV) {
    return redirect('/confirm/error/?reason=service-unavailable');
  }

  const { USERS } = locals.runtime.env;

  try {
    const user = await confirmEmail(USERS, token);

    if (!user) {
      return redirect('/confirm/error/?reason=invalid-token');
    }

    // Success - redirect to confirmation success page
    return redirect('/confirm/success/');
  } catch (error) {
    console.error('Confirmation error:', error);
    return redirect('/confirm/error/?reason=server-error');
  }
};
