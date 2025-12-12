/**
 * GET /api/auth/account/export
 *
 * Returns a JSON export of the authenticated user's account data.
 * Requires KV (production). Returns 503 in local fallback mode.
 */
import type { APIRoute } from 'astro';
import { getCurrentUser, sanitizeUser } from '../../../../lib/auth/kv-auth';

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const USERS = (locals as Record<string, unknown>).runtime?.env?.USERS as KVNamespace | undefined;
    const SESSIONS = (locals as Record<string, unknown>).runtime?.env?.SESSIONS as KVNamespace | undefined;

    if (!USERS || !SESSIONS) {
      return new Response(
        JSON.stringify({ error: 'Account export requires production environment' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const cookieHeader = request.headers.get('cookie');
    const currentUser = await getCurrentUser(USERS, SESSIONS, cookieHeader);

    if (!currentUser) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const exportPayload = {
      user: sanitizeUser(currentUser),
      metadata: {
        exportedAt: new Date().toISOString(),
      },
    };

    return new Response(JSON.stringify({ success: true, data: exportPayload }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Account export error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
