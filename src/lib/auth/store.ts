/**
 * @fileoverview Authentication State Store
 *
 * Client-side authentication state management using nanostores with
 * localStorage persistence. Maintains the current user's login status
 * and syncs with userStore for profile data updates.
 *
 * @module lib/auth/store
 * @see {@link module:lib/auth/userStore} - User profile data (syncs with this)
 * @see {@link module:lib/auth/permissions} - Permission checking
 * @see {@link module:lib/auth/api-client} - API authentication calls
 *
 * ## State Flow
 *
 * ```
 * API Login Success → setAuthFromUser() → authStore updated
 *                                      → subscribeToUser() activated
 *                                      → trackActivity('login')
 *
 * Profile Edit → userStore updated → syncWithUserStore() → authStore synced
 *
 * Logout → logout() → unsubscribe → authStore cleared → trackActivity('logout')
 * ```
 *
 * ## localStorage Keys (prefixed with `auth:`)
 *
 * - `auth:isLoggedIn` - 'true' or 'false'
 * - `auth:userId` - User ID
 * - `auth:userEmail` - Email address
 * - `auth:userName` - Display name
 * - `auth:userRole` - Role string
 * - `auth:userAccessLevel` - Numeric level as string
 * - `auth:userAvatar` - Avatar URL
 * - `auth:loginTime` - ISO timestamp
 *
 * @author How To Win Capitalism Team
 * @since 1.0.0
 */

import { persistentMap } from '@nanostores/persistent';
import {
  getUserById,
  subscribeToUser,
  type UserProfile,
} from './userStore';
import { trackActivity } from './activity';
import { authDebug, debug } from '../debug';

// Auth state shape
export interface AuthState {
  isLoggedIn: string; // 'true' or 'false' (persistent stores use strings)
  userId: string;     // Matches src/content/users/[id].md (THE BRIDGE)
  userEmail: string;
  userName: string;
  userRole: string;   // 'admin' | 'editor' | 'contributor' | 'viewer'
  userAccessLevel: string; // '1' to '10' (persistent stores use strings)
  userAvatar: string;
  loginTime: string;
}

// Default state (not logged in)
const defaultState: AuthState = {
  isLoggedIn: 'false',
  userId: '',
  userEmail: '',
  userName: '',
  userRole: '',
  userAccessLevel: '0',
  userAvatar: '',
  loginTime: '',
};

// Persistent auth store - survives page reloads
export const authStore = persistentMap<AuthState>('auth:', defaultState);

// Store the unsubscribe function for user updates
let userUnsubscribe: (() => void) | null = null;

/**
 * Sync authStore with userStore for the logged-in user
 */
function syncWithUserStore(user: UserProfile | null): void {
  if (!user) return;

  const state = authStore.get();
  if (state.isLoggedIn !== 'true' || state.userId !== user.id) return;

  // Only update if data changed
  if (
    state.userName !== user.name ||
    state.userAvatar !== user.avatar
  ) {
    authStore.setKey('userName', user.name);
    authStore.setKey('userAvatar', user.avatar);
    debug.log('auth:sync', `Synced user data from userStore: ${user.name}`);
  }
}

/**
 * @deprecated Client-side login is deprecated. Use API login instead.
 * Password validation now happens server-side via /api/auth/login
 */
export function login(email: string, password: string): boolean {
  debug.warn('auth', 'Client-side login() is deprecated. Use API login instead.');
  return false;
}

/**
 * Set auth state from API response (called after successful API login)
 */
export function setAuthFromUser(user: UserProfile): void {
  debug.log('auth', `Setting auth state for: ${user.email}`);

  const previousState = authStore.get().isLoggedIn;

  authStore.set({
    isLoggedIn: 'true',
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    userRole: user.role,
    userAccessLevel: String(user.accessLevel),
    userAvatar: user.avatar,
    loginTime: new Date().toISOString(),
  });

  // Subscribe to user profile updates
  if (userUnsubscribe) userUnsubscribe();
  userUnsubscribe = subscribeToUser(user.id, syncWithUserStore);

  // Track the login
  trackActivity('login', '/login');

  // Debug logging
  authDebug.login(user.id, true);
  debug.log('auth', `User role: ${user.role}, Access level: ${user.accessLevel}`);
  authDebug.stateChange(previousState === 'true' ? 'authenticated' : 'anonymous', 'authenticated', 'login');
}

/**
 * Log out the current user
 */
export function logout(): void {
  const currentUser = authStore.get().userEmail;
  debug.log('auth', `Logout initiated for: ${currentUser}`);

  // Clean up user subscription
  if (userUnsubscribe) {
    userUnsubscribe();
    userUnsubscribe = null;
  }

  trackActivity('logout', window.location.pathname);
  authStore.set(defaultState);

  authDebug.logout(currentUser);
  authDebug.stateChange('authenticated', 'anonymous', 'logout');
}

/**
 * Check if user is currently logged in
 */
export function isAuthenticated(): boolean {
  const result = authStore.get().isLoggedIn === 'true';
  authDebug.check(result ? authStore.get().userEmail : null);
  return result;
}

/**
 * Get current user info (or null if not logged in)
 */
export function getCurrentUser(): {
  id: string;
  email: string;
  name: string;
  role: string;
  accessLevel: number;
  avatar: string;
} | null {
  const state = authStore.get();
  if (state.isLoggedIn !== 'true') {
    debug.log('auth:check', 'getCurrentUser: No authenticated user');
    return null;
  }

  debug.log('auth:check', `getCurrentUser: ${state.userId} (${state.userRole}, level ${state.userAccessLevel})`);
  return {
    id: state.userId,
    email: state.userEmail,
    name: state.userName,
    role: state.userRole,
    accessLevel: parseInt(state.userAccessLevel, 10) || 0,
    avatar: state.userAvatar,
  };
}

/**
 * Restore user subscription on page reload
 * Call this on app initialization
 */
export function restoreAuthSubscription(): void {
  const state = authStore.get();
  if (state.isLoggedIn === 'true' && state.userId) {
    // Re-subscribe to user updates
    if (userUnsubscribe) userUnsubscribe();
    userUnsubscribe = subscribeToUser(state.userId, syncWithUserStore);
    debug.log('auth', `Restored subscription for ${state.userId}`);

    // Sync immediately in case user data changed while logged out
    const user = getUserById(state.userId);
    if (user) syncWithUserStore(user);
  }
}
