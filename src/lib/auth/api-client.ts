/**
 * @fileoverview Client-Side Authentication API Client
 *
 * Wrapper for the /api/auth/* endpoints providing a clean interface for
 * client-side authentication operations. Handles httpOnly cookies
 * automatically through fetch credentials.
 *
 * @module lib/auth/api-client
 * @see {@link module:pages/api/auth/me} - Auth check endpoint
 * @see {@link module:pages/api/auth/logout} - Logout endpoint
 * @see {@link module:lib/auth/store} - Uses responses to update auth state
 *
 * ## Authentication Flow
 *
 * ```
 * Client                           Server
 *   │                                │
 *   │──── checkAuth() ──────────────▶│ GET /api/auth/me/
 *   │◀─── { authenticated, user } ───│
 *   │                                │
 *   │──── logout() ─────────────────▶│ POST /api/auth/logout/
 *   │◀─── Cookie cleared ────────────│
 *   │                                │
 *   │──── requireAuth() ────────────▶│ (checks + redirects)
 *   │                                │
 * ```
 *
 * ## Cookie Handling
 *
 * All requests include `credentials: 'include'` to automatically send
 * the httpOnly session cookie. No manual cookie handling required.
 *
 * ## Usage
 *
 * ```typescript
 * // Check if user is logged in
 * const { authenticated, user } = await checkAuth();
 *
 * // Logout
 * await logout();
 *
 * // Require auth (redirects if not authenticated)
 * const user = await requireAuth('/login/');
 * ```
 *
 * @author How To Win Capitalism Team
 * @since 1.0.0
 */

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'contributor' | 'viewer';
  accessLevel: number;
  avatar: string;
  bio: string;
}

export interface AuthResponse {
  authenticated: boolean;
  user: AuthUser | null;
}

/**
 * Check if user is authenticated via API
 */
export async function checkAuth(): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/me/', {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      return { authenticated: false, user: null };
    }

    return await response.json();
  } catch (error) {
    console.error('Auth check failed:', error);
    return { authenticated: false, user: null };
  }
}

/**
 * Logout via API
 */
export async function logout(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/logout/', {
      method: 'POST',
      credentials: 'include',
    });

    return response.ok;
  } catch (error) {
    console.error('Logout failed:', error);
    return false;
  }
}

/**
 * Check auth and redirect if not authenticated
 * For use in page scripts
 */
export async function requireAuth(redirectTo: string = '/login/'): Promise<AuthUser | null> {
  const { authenticated, user } = await checkAuth();

  if (!authenticated) {
    const currentPath = window.location.pathname;
    window.location.href = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
    return null;
  }

  return user;
}
