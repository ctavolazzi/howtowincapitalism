/**
 * @fileoverview SSR Helper Functions for Authentication
 *
 * Helper functions for getting current user in Astro SSR context.
 * Works with both Cloudflare KV (production) and local-auth (development).
 *
 * @module lib/auth/ssr-helpers
 * @see {@link module:lib/auth/kv-auth} - Cloudflare KV authentication
 * @see {@link module:lib/auth/local-auth} - Local development authentication
 */

import { getCurrentUser as getCurrentUserKV, parseSessionCookie } from './kv-auth';
import { parseSessionCookieLocal, getSessionLocal, getUserByIdLocal } from './local-auth';

/**
 * Get current user ID from session in Astro SSR context.
 *
 * This function automatically detects whether KV is available (production)
 * or uses local-auth (development) and returns the user ID or null.
 *
 * @param request - The Astro request object (Astro.request)
 * @param locals - The Astro locals object (Astro.locals)
 * @returns The current user ID, or null if not authenticated
 *
 * @example
 * ```astro
 * ---
 * import { getCurrentUserId } from '../../lib/auth/ssr-helpers';
 *
 * const requesterId = await getCurrentUserId(Astro.request, Astro.locals);
 * const profile = await fetchUserProfile(id, requesterId);
 * ---
 * ```
 */
export async function getCurrentUserId(
  request: Request,
  locals: App.Locals
): Promise<string | null> {
  const cookieHeader = request.headers.get('cookie');
  const hasKV = locals.runtime?.env?.USERS && locals.runtime?.env?.SESSIONS;

  if (hasKV) {
    // Production: Use Cloudflare KV
    const { USERS, SESSIONS } = locals.runtime.env;
    const user = await getCurrentUserKV(USERS, SESSIONS, cookieHeader);
    return user?.id ?? null;
  } else {
    // Local dev: Use in-memory auth
    const token = parseSessionCookieLocal(cookieHeader);
    if (!token) return null;

    const session = getSessionLocal(token);
    if (!session) return null;

    const user = getUserByIdLocal(session.userId);
    return user?.id ?? null;
  }
}
