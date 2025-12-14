/**
 * @fileoverview Local Development Authentication
 *
 * Fallback authentication for local development when Cloudflare KV is not
 * available. Uses in-memory storage that resets on server restart. This
 * provides a seamless development experience without requiring KV setup.
 *
 * @module lib/auth/local-auth
 * @see {@link module:lib/auth/kv-auth} - Production KV-based authentication
 * @see {@link module:pages/api/auth/login} - Login endpoint that uses this
 *
 * ## When This Module Is Used
 *
 * The API routes automatically detect the environment:
 * - If `USERS` and `SESSIONS` KV bindings exist → kv-auth.ts
 * - Otherwise → local-auth.ts (this file)
 *
 * ## Development Users
 *
 * Pre-configured test accounts (passwords are development-only):
 *
 * | Role        | Email               | Password               |
 * |-------------|---------------------|------------------------|
 * | admin       | admin@email.com     | test_admin1   |
 * | editor      | editor@email.com    | test_editor1  |
 * | contributor | contributor@email.com| test_contrib1 |
 * | viewer      | viewer@email.com    | test_viewer1  |
 *
 * ## Key Differences from Production
 *
 * - Sessions stored in memory (Map), not KV
 * - Passwords stored in plaintext (acceptable for dev only)
 * - Less strict cookie settings for easier debugging
 * - No password hashing (direct comparison)
 *
 * @author How To Win Capitalism Team
 * @since 1.0.0
 */

export interface LocalUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'contributor' | 'viewer';
  accessLevel: number;
  avatar: string;
  bio: string;
}

// =============================================================================
// LOCAL DEVELOPMENT USERS
// These are DEVELOPMENT-ONLY credentials, NOT used in production.
// Production credentials are stored in Cloudflare KV (seeded via env vars).
// =============================================================================

const MOCK_USERS: Record<string, LocalUser & { password: string }> = {
  admin: {
    id: 'admin',
    email: 'admin@email.com',
    password: 'test_admin1', 
    name: 'Admin User',
    role: 'admin',
    accessLevel: 10,
    avatar: '/favicon.svg',
    bio: 'Site administrator with full access.',
  },
  editor: {
    id: 'editor',
    email: 'editor@email.com',
    password: 'test_editor1', 
    name: 'Editor User',
    role: 'editor',
    accessLevel: 5,
    avatar: '/favicon.svg',
    bio: 'Content editor with write access.',
  },
  contributor: {
    id: 'contributor',
    email: 'contributor@email.com',
    password: 'test_contrib1', 
    name: 'Contributor User',
    role: 'contributor',
    accessLevel: 3,
    avatar: '/favicon.svg',
    bio: 'Contributor with limited access.',
  },
  viewer: {
    id: 'viewer',
    email: 'viewer@email.com',
    password: 'test_viewer1', 
    name: 'Viewer User',
    role: 'viewer',
    accessLevel: 1,
    avatar: '/favicon.svg',
    bio: 'Read-only viewer.',
  },
};

// Email index for lookup
const EMAIL_INDEX: Record<string, string> = Object.fromEntries(
  Object.values(MOCK_USERS).map((u) => [u.email.toLowerCase(), u.id])
);

// In-memory session storage (resets on restart)
const sessions: Map<string, { userId: string; expiresAt: Date }> = new Map();

// Session config
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours - daily auto-logout
const SESSION_COOKIE_NAME = 'htwc_session';

/**
 * Generate a secure session token using crypto.randomUUID
 */
function generateToken(): string {
  // Use crypto.randomUUID for cryptographically secure tokens
  // Combine two UUIDs for extra entropy (removes dashes for cleaner token)
  return crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
}

/**
 * Validate credentials (local)
 */
export function validateCredentialsLocal(email: string, password: string): LocalUser | null {
  const userId = EMAIL_INDEX[email.toLowerCase()];
  if (!userId) return null;

  const user = MOCK_USERS[userId];
  if (!user || user.password !== password) return null;

  // Return user without password
  const { password: _, ...publicUser } = user;
  return publicUser;
}

/**
 * Create session (local)
 */
export function createSessionLocal(userId: string): { token: string; expiresAt: Date } {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  sessions.set(token, { userId, expiresAt });

  return { token, expiresAt };
}

/**
 * Get session (local)
 */
export function getSessionLocal(token: string): { userId: string } | null {
  const session = sessions.get(token);
  if (!session) return null;

  if (session.expiresAt < new Date()) {
    sessions.delete(token);
    return null;
  }

  return { userId: session.userId };
}

/**
 * Delete session (local)
 */
export function deleteSessionLocal(token: string): void {
  sessions.delete(token);
}

/**
 * Get user by ID (local)
 */
export function getUserByIdLocal(id: string): LocalUser | null {
  const user = MOCK_USERS[id];
  if (!user) return null;

  const { password: _, ...publicUser } = user;
  return publicUser;
}

/**
 * Create session cookie (local) - NOT httpOnly for dev debugging
 */
export function createSessionCookieLocal(token: string, expiresAt: Date): string {
  // In dev, we use a less strict cookie for easier debugging
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; SameSite=Lax; Expires=${expiresAt.toUTCString()}`;
}

/**
 * Create logout cookie (local)
 */
export function createLogoutCookieLocal(): string {
  return `${SESSION_COOKIE_NAME}=; Path=/; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

/**
 * Parse session token from cookie header
 */
export function parseSessionCookieLocal(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map((c) => c.trim());
  const sessionCookie = cookies.find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`));

  if (!sessionCookie) return null;

  return sessionCookie.split('=')[1] || null;
}
