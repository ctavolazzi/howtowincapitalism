/**
 * Cloudflare KV Authentication
 *
 * Server-side auth utilities using Cloudflare KV for storage.
 * Replaces localStorage-based mock auth with proper API auth.
 */

// Types for KV stored data
export interface KVUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'admin' | 'editor' | 'contributor' | 'viewer';
  accessLevel: number;
  avatar: string;
  bio: string;
  createdAt: string;
}

export interface KVSession {
  userId: string;
  createdAt: string;
  expiresAt: string;
}

// Session config
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const SESSION_COOKIE_NAME = 'htwc_session';

/**
 * Simple password hashing using Web Crypto API
 * Note: For production, use bcrypt or argon2 via a worker
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'htwc_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

/**
 * Generate a secure session token
 */
export function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Create a session in KV and return the token
 */
export async function createSession(
  sessions: KVNamespace,
  userId: string
): Promise<{ token: string; expiresAt: Date }> {
  const token = generateSessionToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_MS);

  const session: KVSession = {
    userId,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  // Store with TTL (in seconds)
  await sessions.put(`session:${token}`, JSON.stringify(session), {
    expirationTtl: Math.floor(SESSION_DURATION_MS / 1000),
  });

  return { token, expiresAt };
}

/**
 * Get session from KV by token
 */
export async function getSession(
  sessions: KVNamespace,
  token: string
): Promise<KVSession | null> {
  const data = await sessions.get(`session:${token}`);
  if (!data) return null;

  const session: KVSession = JSON.parse(data);

  // Check if expired (belt and suspenders - KV TTL should handle this)
  if (new Date(session.expiresAt) < new Date()) {
    await sessions.delete(`session:${token}`);
    return null;
  }

  return session;
}

/**
 * Delete a session
 */
export async function deleteSession(sessions: KVNamespace, token: string): Promise<void> {
  await sessions.delete(`session:${token}`);
}

/**
 * Get user by ID from KV
 */
export async function getUserById(users: KVNamespace, id: string): Promise<KVUser | null> {
  const data = await users.get(`user:${id}`);
  if (!data) return null;
  return JSON.parse(data);
}

/**
 * Get user by email (lookup via index)
 */
export async function getUserByEmail(users: KVNamespace, email: string): Promise<KVUser | null> {
  const userId = await users.get(`email:${email.toLowerCase()}`);
  if (!userId) return null;
  return getUserById(users, userId);
}

/**
 * Validate login credentials
 */
export async function validateCredentials(
  users: KVNamespace,
  email: string,
  password: string
): Promise<KVUser | null> {
  const user = await getUserByEmail(users, email);
  if (!user) return null;

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) return null;

  return user;
}

/**
 * Create session cookie header
 */
export function createSessionCookie(token: string, expiresAt: Date): string {
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=${expiresAt.toUTCString()}`;
}

/**
 * Create logout cookie header (clears the session cookie)
 */
export function createLogoutCookie(): string {
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

/**
 * Parse session token from cookie header
 */
export function parseSessionCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map((c) => c.trim());
  const sessionCookie = cookies.find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`));

  if (!sessionCookie) return null;

  return sessionCookie.split('=')[1] || null;
}

/**
 * Get current user from request cookies
 */
export async function getCurrentUser(
  users: KVNamespace,
  sessions: KVNamespace,
  cookieHeader: string | null
): Promise<KVUser | null> {
  const token = parseSessionCookie(cookieHeader);
  if (!token) return null;

  const session = await getSession(sessions, token);
  if (!session) return null;

  return getUserById(users, session.userId);
}

/**
 * Public user data (without sensitive fields)
 */
export function sanitizeUser(user: KVUser) {
  const { passwordHash, ...publicUser } = user;
  return publicUser;
}
