/**
 * Auth Store
 *
 * Client-side authentication state management using nanostores.
 * Persists to localStorage for session persistence across page loads.
 *
 * SYNCS WITH: userStore.ts (the single source of truth for user data)
 *
 * Flow:
 *   1. login() validates credentials via userStore
 *   2. On success, copies user data to authStore (for quick access)
 *   3. Profile edits go to userStore first, then sync to authStore
 *   4. logout() clears authStore but userStore persists
 */

import { persistentMap } from '@nanostores/persistent';
import {
  validateCredentials,
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
 * Attempt to log in with email and password
 * @returns true if successful, false if credentials invalid
 */
export function login(email: string, password: string): boolean {
  debug.log('auth', `Login attempt for: ${email}`);

  // Use unified userStore for validation
  const user = validateCredentials(email, password);

  if (user) {
    const previousState = authStore.get().isLoggedIn;

    authStore.set({
      isLoggedIn: 'true',
      userId: user.id,                         // THE BRIDGE to content collections
      userEmail: user.email,
      userName: user.name,
      userRole: user.role,
      userAccessLevel: String(user.accessLevel),
      userAvatar: user.avatar,
      loginTime: new Date().toISOString(),
    });

    // Subscribe to user profile updates (e.g., when they edit their profile)
    if (userUnsubscribe) userUnsubscribe();
    userUnsubscribe = subscribeToUser(user.id, syncWithUserStore);

    // Track the login
    trackActivity('login', '/login');

    // Debug logging
    authDebug.login(user.id, true);
    debug.log('auth', `User role: ${user.role}, Access level: ${user.accessLevel}`);
    authDebug.stateChange(previousState === 'true' ? 'authenticated' : 'anonymous', 'authenticated', 'login');

    return true;
  }

  authDebug.login(email, false);
  return false;
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
