/**
 * @fileoverview System bulletins for global announcements.
 *
 * Centralized admin control for global announcements.
 * Edit ACTIVE_BULLETIN to broadcast messages to all user dashboards.
 *
 * The profileService injects this bulletin into each profile response
 * based on role targeting and expiration rules.
 *
 * ## Severity Levels
 * - `info`: Blue, informational
 * - `warn`: Yellow, warning
 * - `critical`: Red, urgent (dismissible: false by default)
 *
 * @module lib/config/systemBulletins
 * @see {@link module:lib/api/profileService} - Bulletin injection
 * @see {@link module:components/organisms/profile/SystemBulletin} - Display
 *
 * @todo Move to Cloudflare KV for dynamic updates without redeploy
 *
 * @author How To Win Capitalism Team
 * @since 1.0.0
 */

import type { SystemInjection, WikiRole } from '../auth/schemas/userProfile';

// =============================================================================
// ACTIVE BULLETIN - Edit this to control global announcements
// =============================================================================

/**
 * Currently active system bulletin.
 * Set to null to disable all bulletins.
 */
export const ACTIVE_BULLETIN: SystemInjection | null = {
  id: 'bulletin-v1-launch',
  title: 'Welcome to How To Win Capitalism v1.0!',
  bodyMarkdown: `The wiki is now live! Thank you for being part of our community.

**Getting Started:**
- Browse the [FAQ](/faq/) for common questions
- Check out [Tools](/tools/) for financial calculators
- Contribute by improving existing articles

We're building the definitive open-source guide to financial independence.`,
  severity: 'info',
  createdAt: '2025-12-01T00:00:00Z',
  expiresAt: '2025-12-31T23:59:59Z',
  dismissible: true,
  targetRoles: 'all',
};

// =============================================================================
// BULLETIN HELPER FUNCTIONS
// =============================================================================

/**
 * Check if the bulletin has expired
 */
function isBulletinExpired(bulletin: SystemInjection): boolean {
  if (!bulletin.expiresAt) return false;
  return new Date(bulletin.expiresAt) < new Date();
}

/**
 * Check if a bulletin targets a specific role
 */
function bulletinTargetsRole(bulletin: SystemInjection, role: WikiRole): boolean {
  if (bulletin.targetRoles === 'all') return true;
  return bulletin.targetRoles.includes(role);
}

/**
 * Get the active system bulletin for a user based on their role.
 * Returns null if no bulletin applies or if expired.
 *
 * @param role - The user's wiki role
 * @returns The bulletin or null
 */
export function getActiveBulletinForRole(role: WikiRole): SystemInjection | null {
  if (!ACTIVE_BULLETIN) return null;
  if (isBulletinExpired(ACTIVE_BULLETIN)) return null;
  if (!bulletinTargetsRole(ACTIVE_BULLETIN, role)) return null;

  return ACTIVE_BULLETIN;
}

/**
 * Check if there is an active critical bulletin for emergency notifications
 */
export function hasActiveCriticalBulletin(role: WikiRole): boolean {
  if (!ACTIVE_BULLETIN) return false;
  if (ACTIVE_BULLETIN.severity !== 'critical') return false;
  if (isBulletinExpired(ACTIVE_BULLETIN)) return false;
  return bulletinTargetsRole(ACTIVE_BULLETIN, role);
}
