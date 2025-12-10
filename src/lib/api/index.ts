/**
 * API Layer Barrel Export
 *
 * Central export point for all API services.
 * Import from here for clean imports throughout the codebase.
 *
 * @example
 * import { fetchUserProfile, getActiveBulletinForRole } from '../lib/api';
 */

// Profile Service
export {
  fetchUserProfile,
  getAllUserIds,
  userExists,
} from './profileService';

// System Bulletins (from config)
export {
  getActiveBulletinForRole,
  hasActiveCriticalBulletin,
  ACTIVE_BULLETIN,
} from '../config/systemBulletins';

// Re-export types for convenience
export type {
  UserProfile,
  UserIdentity,
  ActivityEvent,
} from './profileService';
