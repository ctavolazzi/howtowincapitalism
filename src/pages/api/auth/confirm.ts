/**
 * @fileoverview GET /api/auth/confirm - Email confirmation endpoint.
 *
 * Confirms a user's email address via token from confirmation email.
 * Redirects to success or error page based on validation result.
 *
 * @module pages/api/auth/confirm
 * @see {@link module:lib/auth/kv-auth} - Email confirmation logic
 * @see {@link module:lib/email/send-confirmation} - Confirmation email
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
