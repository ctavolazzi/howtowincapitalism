/**
 * Schema Barrel Export
 *
 * Central export point for all data schemas in the application.
 * Import from here for cleaner imports throughout the codebase.
 *
 * @example
 * import { MOCK_FULL_PROFILE, validateProfile } from '@/lib/data/schemas';
 */

export {
  // Schema version
  SCHEMA_VERSION,

  // Badge definitions
  BADGE_DEFINITIONS,

  // Mock profiles for development/testing
  MOCK_FULL_PROFILE,
  MOCK_ADMIN_PROFILE,
  MOCK_READER_PROFILE,

  // Utility functions
  validateProfile,
  createEmptyProfile,

  // Default export
  default as userProfileSchema,
} from './userProfile.js';
