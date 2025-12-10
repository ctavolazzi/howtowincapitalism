/**
 * Profile Actions (Write Layer)
 *
 * Client-side actions for updating user profiles.
 * These wrap the userStore functions with async UX (simulated delay)
 * and field mapping between schema and store.
 *
 * NOTE: This is mock data - in production, these would call real APIs.
 */

import { updateUserProfile as storeUpdateProfile } from '../auth/userStore';
import { debug } from '../debug';

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Simulated network delay for better UX feedback
 */
const SIMULATED_DELAY_MS = 400;

/**
 * Simulate async operation
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// =============================================================================
// PROFILE UPDATES
// =============================================================================

export interface ProfileUpdateData {
  username?: string;
  bio?: string;
  avatarUrl?: string;
}

/**
 * Update user profile identity fields.
 * Maps schema fields (username, avatarUrl) to store fields (name, avatar).
 *
 * @param userId - User ID to update
 * @param updates - Partial profile data
 * @returns Promise resolving to success boolean
 */
export async function updateUserProfile(
  userId: string,
  updates: ProfileUpdateData
): Promise<boolean> {
  await delay(SIMULATED_DELAY_MS);

  debug.log('profileActions', `Updating profile for ${userId}`, updates);

  // Map schema fields to store fields
  const storeUpdates: { name?: string; avatar?: string; bio?: string } = {};

  if (updates.username !== undefined) {
    storeUpdates.name = updates.username;
  }
  if (updates.avatarUrl !== undefined) {
    storeUpdates.avatar = updates.avatarUrl;
  }
  if (updates.bio !== undefined) {
    storeUpdates.bio = updates.bio;
  }

  const result = storeUpdateProfile(userId, storeUpdates);

  if (result) {
    debug.success('profileActions', `Profile updated for ${userId}`);
    return true;
  } else {
    debug.warn('profileActions', `Failed to update profile for ${userId}`);
    return false;
  }
}

// =============================================================================
// PREFERENCE UPDATES
// =============================================================================

export interface PreferenceUpdateData {
  publicEmail?: boolean;
  publicActivity?: boolean;
  emailNotifications?: boolean;
  theme?: 'system' | 'light' | 'dark' | 'retro';
  compactMode?: boolean;
}

/**
 * Update user preferences.
 *
 * NOTE: Currently a mock - preferences are stored in the UserProfile schema
 * but the userStore doesn't persist them separately. This simulates the action
 * for UI purposes. In production, this would call a real API.
 *
 * @param userId - User ID to update
 * @param preferences - Partial preference data
 * @returns Promise resolving to success boolean
 */
export async function updateUserPreferences(
  userId: string,
  preferences: PreferenceUpdateData
): Promise<boolean> {
  await delay(SIMULATED_DELAY_MS);

  debug.log('profileActions', `Updating preferences for ${userId}`, preferences);

  // TODO: Implement actual preference persistence
  // For now, we log the intent and return success
  // The mock profiles in userProfile.ts have preferences baked in

  // Store preferences in localStorage as a temporary measure
  try {
    const key = `user_preferences_${userId}`;
    const existing = localStorage.getItem(key);
    const current = existing ? JSON.parse(existing) : {};
    const updated = { ...current, ...preferences };
    localStorage.setItem(key, JSON.stringify(updated));

    debug.success('profileActions', `Preferences saved to localStorage for ${userId}`);
    return true;
  } catch (err) {
    debug.warn('profileActions', `Failed to save preferences for ${userId}`, err);
    return false;
  }
}

/**
 * Get user preferences from localStorage (for hydration)
 */
export function getUserPreferences(userId: string): PreferenceUpdateData | null {
  try {
    const key = `user_preferences_${userId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}
