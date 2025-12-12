/**
 * Auth Module
 *
 * Mock authentication system for user profiles and activity tracking.
 *
 * ARCHITECTURE:
 *   userStore.ts  → Single source of truth for all user data
 *   store.ts      → Authentication state (who is logged in)
 *   permissions.ts → RBAC access control
 *
 * ACCESS LEVELS:
 *   admin (10)       - Full CRUD on everything
 *   editor (5)       - Create, Read, Update any (no delete)
 *   contributor (3)  - CRUD on own content only
 *   viewer (1)       - Read public content only
 */

// Core auth functions
export {
  authStore,
  login,
  logout,
  isAuthenticated,
  getCurrentUser,
  restoreAuthSubscription,
} from './store';
export type { AuthState } from './store';

// Unified User Store (SINGLE SOURCE OF TRUTH)
// NOTE: Passwords are NOT stored here - only public profile data
// Authentication happens server-side via /api/auth/login
export {
  getAllUsers,
  getUserById,
  getUserByEmail,
  updateUserProfile,
  resetUserProfile,
  resetAllUsers,
  subscribeToUsers,
  subscribeToUser,
  getUsersStore,
  getUsersByRole,
  getActiveUsers,
  searchUsers,
  DEFAULT_USERS,
} from './userStore';
export type { UserProfile, UserRole, UsersState } from './userStore';

// Activity tracking
export { trackActivity, trackPageView, getActivity, getActivitySummary, clearActivity } from './activity';
export type { ActivityEvent } from './activity';

// Permissions (RBAC)
export {
  checkPermission,
  can,
  isOwner,
  isAdmin,
  isEditor,
  isContributor,
  getRequiredLevel,
  ACCESS_LEVELS,
} from './permissions';
export type { Operation, PermissionResult } from './permissions';

// Debug helpers
export { authDebug } from '../debug';
