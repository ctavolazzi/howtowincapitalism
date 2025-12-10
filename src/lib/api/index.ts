/**
 * API Layer Barrel Export
 *
 * Central export point for all API services.
 * Import from here for clean imports throughout the codebase.
 *
 * @example
 * import { fetchUserProfile, getActiveSystemBulletin } from '../lib/api';
 */

// Profile Service
export {
  fetchUserProfile,
  fetchOwnProfile,
  getAllUserIds,
  userExists,
} from './profileService';

// System Bulletins
export {
  getActiveSystemBulletin,
  getAllActiveBulletins,
  hasActiveCriticalBulletin,
  ACTIVE_BULLETINS,
} from './systemBulletins';

// Re-export types for convenience
export type {
  UserProfile,
  UserIdentity,
  ActivityEvent,
} from './profileService';
