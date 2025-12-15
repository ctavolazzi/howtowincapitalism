/**
 * @fileoverview Authentication Module - Public API Entry Point
 *
 * Central export module for all authentication functionality. Re-exports
 * functions from specialized submodules to provide a clean, unified API.
 *
 * @module lib/auth
 * @see {@link module:lib/auth/store} - Auth state management
 * @see {@link module:lib/auth/userStore} - User profile data
 * @see {@link module:lib/auth/permissions} - RBAC permission system
 * @see {@link module:lib/auth/activity} - User activity tracking
 *
 * ## Module Structure
 *
 * ```
 * lib/auth/
 * ├── index.ts        ← Public API (this file)
 * ├── store.ts        ← Auth state (isLoggedIn, currentUser)
 * ├── userStore.ts    ← User profiles (SINGLE SOURCE OF TRUTH)
 * ├── permissions.ts  ← RBAC permission checking
 * ├── activity.ts     ← Activity tracking
 * ├── kv-auth.ts      ← Server-side KV authentication
 * ├── local-auth.ts   ← Local development fallback
 * ├── csrf.ts         ← CSRF token handling
 * ├── rate-limit.ts   ← Rate limiting
 * ├── turnstile.ts    ← CAPTCHA verification
 * └── api-client.ts   ← Client-side API wrapper
 * ```
 *
 * ## Access Levels
 *
 * | Role        | Level | Capabilities                         |
 * |-------------|-------|--------------------------------------|
 * | admin       | 10    | Full CRUD, user management, settings |
 * | editor      | 5     | Create, Read, Update any content     |
 * | contributor | 3     | CRUD on own content only             |
 * | viewer      | 1     | Read public content only             |
 *
 * @author How To Win Capitalism Team
 * @since 1.0.0
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

// SSR helpers
export { getCurrentUserId } from './ssr-helpers';

// Debug helpers
export { authDebug } from '../debug';
