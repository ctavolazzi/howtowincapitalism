/**
 * Mock User Data
 *
 * @deprecated This file is kept for backwards compatibility.
 * The single source of truth is now `userStore.ts`.
 *
 * PREFER IMPORTING FROM:
 *   import { getUserById, validateCredentials } from './userStore';
 *
 * This file will be removed in a future version.
 *
 * ---
 * Multiple users with different permission levels for testing.
 * In a real app, this would be a database lookup.
 *
 * IMPORTANT: The `id` field MUST match the filename in src/content/users/
 * This is the bridge between runtime auth and build-time content ownership.
 *
 * ACCESS LEVELS:
 *   admin (10)       - Full CRUD on everything
 *   editor (5)       - Create, Read, Update any content (no delete)
 *   contributor (3)  - CRUD on own content only
 *   viewer (1)       - Read public content only
 */

export type UserRole = 'admin' | 'editor' | 'contributor' | 'viewer';

export interface MockUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  accessLevel: number;
  avatar: string;
}

// All mock users - indexed by email for login lookup
export const MOCK_USERS: Record<string, MockUser> = {
  'admin@email.com': {
    id: 'crispy',
    email: 'admin@email.com',
    password: "itcan'tbethateasy...",
    name: 'Christopher Tavolazzi',
    role: 'admin',
    accessLevel: 10,
    avatar: '/favicon.svg',
  },
  'editor@email.com': {
    id: 'editor',
    email: 'editor@email.com',
    password: 'editor123',
    name: 'Editor',
    role: 'editor',
    accessLevel: 5,
    avatar: '/favicon.svg',
  },
  'contributor@email.com': {
    id: 'contributor',
    email: 'contributor@email.com',
    password: 'contrib123',
    name: 'Contributor',
    role: 'contributor',
    accessLevel: 3,
    avatar: '/favicon.svg',
  },
  'viewer@email.com': {
    id: 'viewer',
    email: 'viewer@email.com',
    password: 'viewer123',
    name: 'Viewer',
    role: 'viewer',
    accessLevel: 1,
    avatar: '/favicon.svg',
  },
};

// Default user for backwards compatibility
export const MOCK_USER = MOCK_USERS['admin@email.com'];

/**
 * Validate credentials and return the user if valid
 */
export function validateCredentials(email: string, password: string): MockUser | null {
  const user = MOCK_USERS[email];
  if (user && user.password === password) {
    return user;
  }
  return null;
}

/**
 * Get user by ID (for content ownership lookup)
 */
export function getUserById(id: string): MockUser | null {
  return Object.values(MOCK_USERS).find(u => u.id === id) || null;
}

/**
 * Get all users (for admin panel)
 */
export function getAllUsers(): MockUser[] {
  return Object.values(MOCK_USERS);
}
