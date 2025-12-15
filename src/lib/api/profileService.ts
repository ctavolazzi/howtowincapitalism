/**
 * @fileoverview Profile service for server-side profile fetching.
 *
 * Production-ready server-side service layer for fetching user profiles.
 * Designed to be called from Astro Frontmatter for SSR.
 *
 * ## Features
 * - Viewer context: Different data returned based on who is viewing
 * - Privacy filtering: Respects user preferences for public/private data
 * - Data normalization: Avatar fallbacks, consistent date formats
 * - System bulletin injection from centralized config
 * - Simulated latency for development/testing
 * - Error state handling for testing 404/500 pages
 *
 * @module lib/api/profileService
 * @see {@link module:lib/auth/schemas/userProfile} - Profile types
 * @see {@link module:lib/config/systemBulletins} - System bulletins
 *
 * @example
 * ```astro
 * ---
 * import { fetchUserProfile } from '../lib/api';
 * import { getCurrentUser } from '../lib/auth';
 *
 * const currentUser = getCurrentUser();
 * const profile = await fetchUserProfile(
 *   Astro.params.id,
 *   currentUser?.id ?? null
 * );
 * if (!profile) return Astro.redirect('/404');
 * ---
 * ```
 *
 * @author How To Win Capitalism Team
 * @since 1.0.0
 */

import type { UserProfile, UserIdentity, ActivityEvent } from '../auth/schemas/userProfile';
import { getMockProfile, MOCK_PROFILES } from '../auth/schemas/userProfile';
import { getActiveBulletinForRole } from '../config/systemBulletins';

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Simulated database latency in milliseconds.
 * Set to 0 in production when not needed.
 */
const SIMULATED_LATENCY_MS = 300;

/**
 * Whether to enable latency simulation.
 * Toggle for development/testing.
 */
const ENABLE_LATENCY_SIMULATION = true;

/**
 * Base URL for avatar fallback generation
 */
const AVATAR_FALLBACK_BASE = 'https://ui-avatars.com/api/';

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
 * Generate a fallback avatar URL using ui-avatars.com
 * Creates a consistent avatar based on username
 */
function generateAvatarFallback(username: string): string {
  const params = new URLSearchParams({
    name: username,
    background: '0D8ABC',
    color: 'fff',
    size: '128',
    bold: 'true',
  });
  return `${AVATAR_FALLBACK_BASE}?${params.toString()}`;
}

/**
 * Normalize avatar URL - ensures a valid URL is always returned
 */
function normalizeAvatarUrl(avatarUrl: string | null | undefined, username: string): string {
  if (!avatarUrl || avatarUrl.trim() === '') {
    return generateAvatarFallback(username);
  }
  return avatarUrl;
}

/**
 * Ensure all dates are ISO strings (for SSR serialization)
 */
function normalizeDates(profile: UserProfile): void {
  // Identity dates
  if (profile.identity.joinedAt && typeof profile.identity.joinedAt !== 'string') {
    profile.identity.joinedAt = new Date(profile.identity.joinedAt).toISOString();
  }
  if (profile.identity.lastActiveAt && typeof profile.identity.lastActiveAt !== 'string') {
    profile.identity.lastActiveAt = new Date(profile.identity.lastActiveAt).toISOString();
  }

  // Activity log dates
  profile.activityLog.forEach((event) => {
    if (event.timestamp && typeof event.timestamp !== 'string') {
      event.timestamp = new Date(event.timestamp).toISOString();
    }
  });

  // Stats dates
  if (profile.stats.lastEditAt && typeof profile.stats.lastEditAt !== 'string') {
    profile.stats.lastEditAt = new Date(profile.stats.lastEditAt).toISOString();
  }
}

/**
 * Activity types that should be hidden from non-owners
 */
const PRIVATE_ACTIVITY_TYPES: ActivityEvent['type'][] = ['login', 'profile'];

/**
 * Apply privacy filters for non-owner viewers
 * - Removes private activity types
 * - Masks email if publicEmail is false
 * - Removes preferences object entirely
 */
function applyPrivacyFilters(profile: UserProfile, isOwner: boolean): void {
  if (isOwner) {
    // Owner sees everything - no filtering needed
    return;
  }

  // === Non-owner viewing ===

  // 1. Mask email if not public
  if (!profile.preferences.publicEmail) {
    profile.identity.email = '[hidden]';
  }

  // 2. Filter activity log
  if (!profile.preferences.publicActivity) {
    // Hide all activity if not public
    profile.activityLog = [];
  } else {
    // Remove private activity types (login, profile edits, drafts)
    profile.activityLog = profile.activityLog.filter(
      (event) => !PRIVATE_ACTIVITY_TYPES.includes(event.type)
    );
  }

  // 3. Remove preferences object entirely for non-owners
  // Cast to any to allow deletion, then reassign
  (profile as Record<string, unknown>).preferences = null;
}

// =============================================================================
// MAIN SERVICE FUNCTION
// =============================================================================

/**
 * Fetch a user profile by ID with viewer context.
 *
 * This is the primary entry point for the profile service.
 * Call this from Astro Frontmatter for server-side rendering.
 *
 * Privacy behavior:
 * - If requesterUserId === targetUserId (owner): Full profile returned
 * - If requesterUserId !== targetUserId (visitor): Privacy filters applied
 *   - Email masked if publicEmail is false
 *   - Private activity types removed
 *   - Preferences object removed
 *
 * @param targetUserId - The user ID to fetch
 * @param requesterUserId - The ID of the user making the request (null if anonymous)
 * @returns The user profile (privacy-filtered if not owner), or null if not found
 * @throws Error if targetUserId === 'error' (for testing 500 pages)
 *
 * @example
 * // In Astro Frontmatter:
 * const profile = await fetchUserProfile('crispy', currentUser?.id);
 * if (!profile) return Astro.redirect('/404');
 */
export async function fetchUserProfile(
  targetUserId: string,
  requesterUserId?: string | null
): Promise<UserProfile | null> {
  // Simulate database latency
  await simulateLatency();

  // === Error State Testing ===
  if (targetUserId === 'error') {
    throw new Error('Simulated 500 Failure');
  }

  // === Not Found Testing ===
  if (targetUserId === 'missing') {
    return null;
  }

  // === Normal Flow ===
  const rawProfile = getMockProfile(targetUserId);

  if (!rawProfile) {
    return null;
  }

  // Clone using structuredClone to avoid mutating mock data
  const profile = structuredClone(rawProfile);

  // === Determine Viewer Context ===
  const isOwner = targetUserId === requesterUserId;

  // === Data Normalization ===
  // 1. Normalize avatar URL (generate fallback if missing)
  profile.identity.avatarUrl = normalizeAvatarUrl(
    profile.identity.avatarUrl,
    profile.identity.username
  );

  // 2. Normalize all dates to ISO strings
  normalizeDates(profile);

  // === System Injection ===
  // Inject active system bulletin based on user's role
  const bulletin = getActiveBulletinForRole(profile.identity.role);
  profile.systemInjection = bulletin;

  // === Privacy Filtering ===
  // Apply viewer-context-based privacy filters
  applyPrivacyFilters(profile, isOwner);

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
