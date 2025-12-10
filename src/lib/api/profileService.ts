/**
 * Profile Service
 *
 * Server-side service layer for fetching user profiles.
 * Designed to be called from Astro Frontmatter for SSR.
 *
 * Features:
 * - Simulated latency (300ms) to mimic real database calls
 * - System bulletin injection from centralized config
 * - Sensitive data sanitization based on user preferences
 * - Error state handling for testing 404/500 pages
 *
 * Usage in Astro Frontmatter:
 * ```astro
 * ---
 * import { fetchUserProfile } from '../lib/api/profileService';
 *
 * const profile = await fetchUserProfile(Astro.params.id);
 * if (!profile) return Astro.redirect('/404');
 * ---
 * ```
 */

import type { UserProfile, UserIdentity, ActivityEvent } from '../auth/schemas/userProfile';
import { getMockProfile, MOCK_PROFILES } from '../auth/schemas/userProfile';
import { getActiveSystemBulletin } from './systemBulletins';

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Simulated database latency in milliseconds.
 * Set to 0 in production or when latency simulation is not needed.
 */
const SIMULATED_LATENCY_MS = 300;

/**
 * Whether to enable latency simulation.
 * Can be toggled for development/testing.
 */
const ENABLE_LATENCY_SIMULATION = true;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Simulate network/database latency
 */
async function simulateLatency(): Promise<void> {
  if (ENABLE_LATENCY_SIMULATION && SIMULATED_LATENCY_MS > 0) {
    await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));
  }
}

/**
 * Sanitize user identity based on privacy preferences.
 * Strips email if publicEmail is false.
 */
function sanitizeIdentity(
  identity: UserIdentity,
  preferences: UserProfile['preferences']
): UserIdentity {
  const sanitized = { ...identity };

  // Strip email if user has not opted into public email
  if (!preferences.publicEmail) {
    sanitized.email = '[hidden]';
  }

  return sanitized;
}

/**
 * Sanitize activity log based on privacy preferences.
 * Returns empty array if publicActivity is false.
 */
function sanitizeActivityLog(
  activityLog: ActivityEvent[],
  preferences: UserProfile['preferences']
): ActivityEvent[] {
  // If user has not opted into public activity, return empty array
  if (!preferences.publicActivity) {
    return [];
  }

  // Filter out sensitive activity types (like login events)
  return activityLog.filter((event) => event.type !== 'login');
}

/**
 * Deep clone a profile to avoid mutating the original mock data
 */
function cloneProfile(profile: UserProfile): UserProfile {
  return JSON.parse(JSON.stringify(profile));
}

// =============================================================================
// MAIN SERVICE FUNCTION
// =============================================================================

/**
 * Fetch a user profile by ID.
 *
 * This is the primary entry point for the profile service.
 * Call this from Astro Frontmatter for server-side rendering.
 *
 * @param userId - The user ID to fetch
 * @returns The sanitized user profile, or null if not found
 * @throws Error if userId === 'error' (for testing 500 pages)
 *
 * @example
 * // In Astro Frontmatter:
 * const profile = await fetchUserProfile('crispy');
 * if (!profile) return Astro.redirect('/404');
 */
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  // Simulate database latency
  await simulateLatency();

  // === Error State Testing ===
  // Throw error for testing 500 error boundary
  if (userId === 'error') {
    throw new Error('Internal server error: Database connection failed');
  }

  // === Not Found Testing ===
  // Return null for testing 404 handling
  if (userId === 'missing') {
    return null;
  }

  // === Normal Flow ===
  // Look up user in mock profiles
  const rawProfile = getMockProfile(userId);

  if (!rawProfile) {
    return null;
  }

  // Clone to avoid mutating mock data
  const profile = cloneProfile(rawProfile);

  // === System Injection ===
  // Inject active system bulletin based on user's role
  const bulletin = getActiveSystemBulletin(profile.identity.role);
  profile.systemInjection = bulletin;

  // === Data Sanitization ===
  // Strip sensitive data based on user preferences
  profile.identity = sanitizeIdentity(profile.identity, profile.preferences);
  profile.activityLog = sanitizeActivityLog(profile.activityLog, profile.preferences);

  return profile;
}

/**
 * Fetch a user profile without sanitization.
 * Use this for authenticated users viewing their own profile.
 *
 * @param userId - The user ID to fetch
 * @returns The full user profile (unsanitized), or null if not found
 */
export async function fetchOwnProfile(userId: string): Promise<UserProfile | null> {
  await simulateLatency();

  if (userId === 'error') {
    throw new Error('Internal server error: Database connection failed');
  }

  if (userId === 'missing') {
    return null;
  }

  const rawProfile = getMockProfile(userId);
  if (!rawProfile) return null;

  const profile = cloneProfile(rawProfile);

  // Inject system bulletin
  profile.systemInjection = getActiveSystemBulletin(profile.identity.role);

  // Return full profile without sanitization
  return profile;
}

/**
 * Get all available user IDs.
 * Useful for generating static paths in Astro.
 *
 * @returns Array of user IDs
 */
export function getAllUserIds(): string[] {
  return Object.keys(MOCK_PROFILES);
}

/**
 * Check if a user exists without fetching full profile.
 * Useful for validation before expensive operations.
 *
 * @param userId - The user ID to check
 * @returns True if user exists
 */
export function userExists(userId: string): boolean {
  return userId in MOCK_PROFILES;
}

// =============================================================================
// TYPE EXPORTS
// =============================================================================

// Re-export types for convenience
export type { UserProfile, UserIdentity, ActivityEvent } from '../auth/schemas/userProfile';
