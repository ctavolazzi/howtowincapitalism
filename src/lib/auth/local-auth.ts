/**
 * Local Development Auth
 *
 * Fallback auth for local development when KV is not available.
 * Uses in-memory storage (resets on server restart).
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

// Mock users (same as KV seed data)
// ROTATED 2024-12-10 after GitGuardian alert
const MOCK_USERS: Record<string, LocalUser & { password: string }> = {
  admin: {
    id: 'admin',
    email: 'admin@email.com',
    password: 'Adm!n_Secure_2024#',
    name: 'Admin User',
    role: 'admin',
    accessLevel: 10,
    avatar: '/favicon.svg',
    bio: 'Site administrator with full access.',
  },
  editor: {
    id: 'editor',
    email: 'editor@email.com',
    password: 'Ed!tor_Access_2024#',
    name: 'Editor User',
    role: 'editor',
    accessLevel: 5,
    avatar: '/favicon.svg',
    bio: 'Content editor with write access.',
  },
  contributor: {
    id: 'contributor',
    email: 'contributor@email.com',
    password: 'Contr!b_Pass_2024#',
    name: 'Contributor User',
    role: 'contributor',
    accessLevel: 3,
    avatar: '/favicon.svg',
    bio: 'Contributor with limited access.',
  },
  viewer: {
    id: 'viewer',
    email: 'viewer@email.com',
    password: 'V!ewer_Read_2024#',
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
