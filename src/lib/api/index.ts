/**
 * API Layer Barrel Export
 *
 * Central export point for all API services.
 * Import from here for clean imports throughout the codebase.
 *
 * @example
 * import { fetchUserProfile, getActiveBulletinForRole } from '../lib/api';
 */

// Profile Service (Read)
export {
  fetchUserProfile,
  getAllUserIds,
  userExists,
} from './profileService';

// Profile Actions (Write)
export {
  updateUserProfile,
  updateUserPreferences,
  getUserPreferences,
} from './profileActions';

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

export type {
  ProfileUpdateData,
  PreferenceUpdateData,
} from './profileActions';
