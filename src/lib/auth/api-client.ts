/**
 * Client-side Auth API
 *
 * Wrapper for the /api/auth/* endpoints.
 * Uses httpOnly cookies (automatically sent with requests).
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
