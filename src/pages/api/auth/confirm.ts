/**
 * GET /api/auth/confirm
 *
 * Confirms a user's email address via token.
 * Redirects to success or error page.
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
