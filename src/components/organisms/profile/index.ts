/**
 * @fileoverview Barrel export for profile organism components.
 *
 * Re-exports all profile-related organism components for convenient
 * importing from a single location.
 *
 * @module components/organisms/profile
 * @see {@link module:components/organisms/profile/ProfileHeader}
 * @see {@link module:components/organisms/profile/ProfileForm}
 * @see {@link module:components/organisms/profile/ActivityFeed}
 * @see {@link module:components/organisms/profile/SystemBulletin}
 *
 * @example
 * ```typescript
 * import { ProfileHeader, ProfileForm, ActivityFeed, SystemBulletin } from '../organisms/profile';
 * ```
 *
 * @author How To Win Capitalism Team
 * @since 1.0.0
 */

export { default as ProfileHeader } from './ProfileHeader.astro';
export { default as SystemBulletin } from './SystemBulletin.astro';
export { default as ActivityFeed } from './ActivityFeed.astro';
export { default as ProfileForm } from './ProfileForm.astro';
