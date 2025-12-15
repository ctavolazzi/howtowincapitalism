/**
 * @fileoverview API layer barrel export for all API services.
 *
 * Central export point for all API services including profile
 * management, user actions, and system bulletins.
 *
 * @module lib/api
 * @see {@link module:lib/api/profileService} - Profile read operations
 * @see {@link module:lib/api/profileActions} - Profile write operations
 * @see {@link module:lib/config/systemBulletins} - System announcements
 *
 * @example
 * ```typescript
 * import { fetchUserProfile, getActiveBulletinForRole } from '../lib/api';
 * ```
 *
 * @author How To Win Capitalism Team
 * @since 1.0.0
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
