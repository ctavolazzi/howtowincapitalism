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
  // Email confirmation fields
  emailConfirmed: boolean;
  confirmToken?: string;
  confirmTokenExpires?: string;
}

export interface KVSession {
  userId: string;
  createdAt: string;
  expiresAt: string;
}

// Session config
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const SESSION_COOKIE_NAME = 'htwc_session';

// PBKDF2 Configuration
const PBKDF2_ITERATIONS = 100000;
const PBKDF2_SALT_LENGTH = 16; // 16 bytes = 128 bits
const PBKDF2_KEY_LENGTH = 32; // 32 bytes = 256 bits

/**
 * Convert ArrayBuffer to hex string
 */
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert hex string to ArrayBuffer
 */
function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * V1 password hashing (SHA-256 with static salt) - LEGACY
 * Kept for backward compatibility during migration
 */
async function hashPasswordV1(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'htwc_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * V2 password hashing using PBKDF2 with per-user random salt
 * Format: v2:${iterations}:${saltHex}:${hashHex}
 */
export async function hashPasswordV2(password: string): Promise<string> {
  const encoder = new TextEncoder();

  // Generate random salt
  const salt = crypto.getRandomValues(new Uint8Array(PBKDF2_SALT_LENGTH));

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  // Derive key using PBKDF2
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    PBKDF2_KEY_LENGTH * 8 // bits
  );

  const hashHex = bufferToHex(derivedBits);
  const saltHex = bufferToHex(salt.buffer);

  return `v2:${PBKDF2_ITERATIONS}:${saltHex}:${hashHex}`;
}

/**
 * Verify V2 PBKDF2 password hash
 */
async function verifyPasswordV2(password: string, hash: string): Promise<boolean> {
  const parts = hash.split(':');
  if (parts.length !== 4 || parts[0] !== 'v2') {
    return false;
  }

  const iterations = parseInt(parts[1], 10);
  const saltHex = parts[2];
  const storedHashHex = parts[3];

  const encoder = new TextEncoder();
  const salt = hexToBuffer(saltHex);

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  // Derive key using PBKDF2 with stored salt and iterations
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    PBKDF2_KEY_LENGTH * 8 // bits
  );

  const computedHashHex = bufferToHex(derivedBits);

  // Constant-time comparison
  if (computedHashHex.length !== storedHashHex.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < computedHashHex.length; i++) {
    result |= computedHashHex.charCodeAt(i) ^ storedHashHex.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Check if a password hash needs upgrading from V1 to V2
 */
export function needsHashUpgrade(hash: string): boolean {
  return !hash.startsWith('v2:');
}

/**
 * Simple password hashing - uses V2 (PBKDF2) by default
 * For new registrations, always use hashPasswordV2
 */
export async function hashPassword(password: string): Promise<string> {
  return hashPasswordV2(password);
}

/**
 * Verify password against stored hash
 * Automatically detects V1 (SHA-256) vs V2 (PBKDF2) format
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (hash.startsWith('v2:')) {
    return verifyPasswordV2(password, hash);
  }
  // V1 legacy hash (SHA-256 with static salt)
  const passwordHash = await hashPasswordV1(password);
  return passwordHash === hash;
}

/**
 * Upgrade a user's password hash from V1 to V2
 * Call this after successful V1 login to transparently migrate
 */
export async function upgradePasswordHash(
  users: KVNamespace,
  userId: string,
  password: string
): Promise<void> {
  const user = await getUserById(users, userId);
  if (!user) return;

  // Hash with V2
  const newHash = await hashPasswordV2(password);
  user.passwordHash = newHash;

  // Save updated user
  await users.put(`user:${user.id}`, JSON.stringify(user));
  console.log(`Upgraded password hash for user ${userId} from V1 to V2 (PBKDF2)`);
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
  const { passwordHash, confirmToken, confirmTokenExpires, ...publicUser } = user;
  return publicUser;
}

/**
 * Generate a confirmation token
 */
export function generateConfirmToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Create a new user in KV (unconfirmed)
 */
export async function createUser(
  users: KVNamespace,
  data: {
    username: string;
    name: string;
    email: string;
    password: string;
  }
): Promise<{ user: KVUser; confirmToken: string }> {
  // Check if email already exists
  const existing = await getUserByEmail(users, data.email);
  if (existing) {
    throw new Error('Email already registered');
  }

  // Check if username already exists
  const existingUsername = await getUserById(users, data.username);
  if (existingUsername) {
    throw new Error('Username already taken');
  }

  const passwordHash = await hashPassword(data.password);
  const confirmToken = generateConfirmToken();
  const now = new Date();
  const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

  const user: KVUser = {
    id: data.username,
    email: data.email.toLowerCase(),
    passwordHash,
    name: data.name,
    role: 'viewer', // New users start as viewers
    accessLevel: 1,
    avatar: '/favicon.svg',
    bio: '',
    createdAt: now.toISOString(),
    emailConfirmed: false,
    confirmToken,
    confirmTokenExpires: expires.toISOString(),
  };

  // Store user
  await users.put(`user:${user.id}`, JSON.stringify(user));

  // Store email index
  await users.put(`email:${user.email}`, user.id);

  // Store token index (for lookup during confirmation)
  await users.put(`confirm:${confirmToken}`, user.id, {
    expirationTtl: 24 * 60 * 60, // 24 hours
  });

  return { user, confirmToken };
}

/**
 * Confirm a user's email
 */
export async function confirmEmail(
  users: KVNamespace,
  token: string
): Promise<KVUser | null> {
  // Look up user by token
  const userId = await users.get(`confirm:${token}`);
  if (!userId) {
    return null; // Token invalid or expired
  }

  // Get user
  const user = await getUserById(users, userId);
  if (!user) {
    return null;
  }

  // Verify token matches
  if (user.confirmToken !== token) {
    return null;
  }

  // Check if token expired
  if (user.confirmTokenExpires && new Date(user.confirmTokenExpires) < new Date()) {
    return null;
  }

  // Update user as confirmed
  user.emailConfirmed = true;
  delete user.confirmToken;
  delete user.confirmTokenExpires;

  // Save updated user
  await users.put(`user:${user.id}`, JSON.stringify(user));

  // Delete token index
  await users.delete(`confirm:${token}`);

  return user;
}

/**
 * Validate credentials (only for confirmed users)
 */
export async function validateCredentialsWithConfirmation(
  users: KVNamespace,
  email: string,
  password: string
): Promise<{ user: KVUser | null; needsConfirmation: boolean }> {
  const user = await getUserByEmail(users, email);
  if (!user) {
    return { user: null, needsConfirmation: false };
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return { user: null, needsConfirmation: false };
  }

  if (!user.emailConfirmed) {
    return { user: null, needsConfirmation: true };
  }

  return { user, needsConfirmation: false };
}
