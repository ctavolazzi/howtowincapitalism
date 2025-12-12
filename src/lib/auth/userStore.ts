/**
 * Unified User Store
 *
 * SINGLE SOURCE OF TRUTH for all user data in the app.
 *
 * Architecture:
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │                         UNIFIED USER STORE                              │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │                                                                         │
 * │  DEFAULT_USERS (immutable)  →  userStore (persistent)                  │
 * │  (credentials & roles)         (editable profile data)                  │
 * │                                                                         │
 * │  On Login:    userStore syncs → authStore                              │
 * │  On Edit:     userStore updates → authStore (if logged in user)        │
 * │  On Logout:   authStore clears (userStore persists)                    │
 * │                                                                         │
 * │  Profile Pages read from: userStore (not content collections)          │
 * │  Permissions read from: userStore (via authStore sync)                 │
 * │                                                                         │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

import { persistentMap, persistentAtom } from '@nanostores/persistent';
import { map, computed } from 'nanostores';
import { debug } from '../debug';

// =============================================================================
// TYPES
// =============================================================================

export type UserRole = 'admin' | 'editor' | 'contributor' | 'viewer';

export interface UserProfile {
  // Immutable (set at creation, can't be changed)
  id: string;
  email: string;
  role: UserRole;
  accessLevel: number;
  createdAt: string;

  // Editable by user
  name: string;
  avatar: string;
  bio: string;

  // Editable by admin only
  isActive: boolean;
}

export interface UsersState {
  [userId: string]: UserProfile;
}

// =============================================================================
// DEFAULT USERS (Public profile data only - NO PASSWORDS)
// Passwords are stored ONLY in server-side files (local-auth.ts, kv-auth.ts)
// =============================================================================

export const DEFAULT_USERS: Record<string, UserProfile> = {
  admin: {
    id: 'admin',
    email: 'admin@email.com',
    name: 'Admin User',
    role: 'admin',
    accessLevel: 10,
    avatar: '/favicon.svg',
    bio: 'Site administrator with full access.',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
  },
  editor: {
    id: 'editor',
    email: 'editor@email.com',
    name: 'Editor',
    role: 'editor',
    accessLevel: 5,
    avatar: '/favicon.svg',
    bio: 'Content editor with full edit access to all content.',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
  },
  contributor: {
    id: 'contributor',
    email: 'contributor@email.com',
    name: 'Contributor',
    role: 'contributor',
    accessLevel: 3,
    avatar: '/favicon.svg',
    bio: 'Content contributor who can create and manage their own content.',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
  },
  viewer: {
    id: 'viewer',
    email: 'viewer@email.com',
    name: 'Viewer',
    role: 'viewer',
    accessLevel: 1,
    avatar: '/favicon.svg',
    bio: 'Read-only user with access to public content.',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
  },
};

// =============================================================================
// PERSISTENT USER STORE
// =============================================================================

// Store users as JSON string in localStorage
const usersJson = persistentAtom<string>('users_data', JSON.stringify({}), {
  encode: (value) => value,
  decode: (value) => value,
});

/**
 * Initialize users store with defaults if empty
 */
function initializeStore(): UsersState {
  const stored = usersJson.get();
  let users: UsersState = {};

  try {
    users = JSON.parse(stored);
  } catch {
    users = {};
  }

  // Merge defaults with stored (stored takes priority for editable fields)
  const merged: UsersState = {};

  for (const [id, defaultUser] of Object.entries(DEFAULT_USERS)) {
    const stored = users[id];
    merged[id] = {
      // Always use default for immutable fields
      id: defaultUser.id,
      email: defaultUser.email,
      role: defaultUser.role,
      accessLevel: defaultUser.accessLevel,
      createdAt: defaultUser.createdAt,
      isActive: stored?.isActive ?? defaultUser.isActive,

      // Use stored value if exists, otherwise default
      name: stored?.name ?? defaultUser.name,
      avatar: stored?.avatar ?? defaultUser.avatar,
      bio: stored?.bio ?? defaultUser.bio,
    };
  }

  debug.log('users', 'User store initialized', { userCount: Object.keys(merged).length });
  return merged;
}

// In-memory reactive store
const usersStore = map<UsersState>(initializeStore());

// Sync to localStorage whenever store changes
usersStore.subscribe((state) => {
  usersJson.set(JSON.stringify(state));
  debug.log('users', 'User store synced to localStorage');
});

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Get all users
 */
export function getAllUsers(): UserProfile[] {
  return Object.values(usersStore.get());
}

/**
 * Get user by ID
 */
export function getUserById(id: string): UserProfile | null {
  return usersStore.get()[id] || null;
}

/**
 * Get user by email (public profile only - NO PASSWORD)
 * For authentication, use server-side API routes
 */
export function getUserByEmail(email: string): UserProfile | null {
  const defaultUser = Object.values(DEFAULT_USERS).find((u) => u.email === email);
  if (!defaultUser) return null;

  const profile = usersStore.get()[defaultUser.id];
  return profile || null;
}

// NOTE: validateCredentials has been removed from client-side code
// All authentication happens server-side via /api/auth/login

/**
 * Update user profile (editable fields only)
 */
export function updateUserProfile(
  userId: string,
  updates: Partial<Pick<UserProfile, 'name' | 'avatar' | 'bio'>>
): UserProfile | null {
  const current = usersStore.get();
  const user = current[userId];

  if (!user) {
    debug.warn('users', `Cannot update: user ${userId} not found`);
    return null;
  }

  const updated: UserProfile = {
    ...user,
    name: updates.name ?? user.name,
    avatar: updates.avatar ?? user.avatar,
    bio: updates.bio ?? user.bio,
  };

  usersStore.setKey(userId, updated);
  debug.success('users', `Profile updated for ${userId}`, updates);

  return updated;
}

/**
 * Update user status (admin only)
 */
export function setUserActive(userId: string, isActive: boolean): boolean {
  const current = usersStore.get();
  const user = current[userId];

  if (!user) return false;

  usersStore.setKey(userId, { ...user, isActive });
  debug.log('users', `User ${userId} active status: ${isActive}`);
  return true;
}

/**
 * Reset user profile to defaults
 */
export function resetUserProfile(userId: string): UserProfile | null {
  const defaultUser = DEFAULT_USERS[userId];
  if (!defaultUser) return null;

  usersStore.setKey(userId, defaultUser);
  debug.log('users', `Profile reset to defaults for ${userId}`);
  return defaultUser;
}

/**
 * Reset ALL users to defaults (danger!)
 */
export function resetAllUsers(): void {
  const defaults: UsersState = { ...DEFAULT_USERS };
  usersStore.set(defaults);
  debug.warn('users', 'All user profiles reset to defaults');
}

/**
 * Subscribe to user store changes
 */
export function subscribeToUsers(callback: (users: UsersState) => void): () => void {
  return usersStore.subscribe(callback);
}

/**
 * Subscribe to single user changes
 */
export function subscribeToUser(
  userId: string,
  callback: (user: UserProfile | null) => void
): () => void {
  return usersStore.subscribe((state) => {
    callback(state[userId] || null);
  });
}

/**
 * Get the reactive store (for direct subscription)
 */
export function getUsersStore() {
  return usersStore;
}

// =============================================================================
// COMPUTED VALUES
// =============================================================================

/**
 * Get users by role
 */
export function getUsersByRole(role: UserRole): UserProfile[] {
  return Object.values(usersStore.get()).filter((u) => u.role === role);
}

/**
 * Get active users only
 */
export function getActiveUsers(): UserProfile[] {
  return Object.values(usersStore.get()).filter((u) => u.isActive);
}

/**
 * Search users by name
 */
export function searchUsers(query: string): UserProfile[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(usersStore.get()).filter(
    (u) =>
      u.name.toLowerCase().includes(lowerQuery) ||
      u.role.toLowerCase().includes(lowerQuery) ||
      u.bio.toLowerCase().includes(lowerQuery)
  );
}
