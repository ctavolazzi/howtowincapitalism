/**
 * System Bulletins Configuration
 *
 * Centralized admin control for global announcements.
 * Edit this file to broadcast messages to all user dashboards.
 *
 * Usage:
 * - Add bulletins to ACTIVE_BULLETINS array
 * - Set targetRoles to filter which users see the bulletin
 * - Set expiresAt for auto-dismissal
 * - The profileService will inject the appropriate bulletin into each profile response
 */

import type { SystemInjection, WikiRole } from '../auth/schemas/userProfile';

// =============================================================================
// ACTIVE BULLETINS - Edit this array to control global announcements
// =============================================================================

/**
 * Currently active system bulletins.
 * These are injected into user profiles based on role targeting.
 */
export const ACTIVE_BULLETINS: SystemInjection[] = [
  {
    id: 'bulletin-v1-launch',
    title: 'Welcome to How To Win Capitalism v1.0!',
    bodyMarkdown: `The wiki is now live! Thank you for being part of our community.

**Getting Started:**
- Browse the [FAQ](/faq/) for common questions
- Check out [Tools](/tools/) for financial calculators
- Read the [Contributing Guide](/docs/contributing/) to help improve articles`,
    severity: 'info',
    createdAt: '2025-12-01T00:00:00Z',
    expiresAt: '2025-12-31T23:59:59Z',
    dismissible: true,
    targetRoles: 'all',
  },
  // Uncomment to test warning bulletin:
  // {
  //   id: 'bulletin-maintenance',
  //   title: 'Scheduled Maintenance',
  //   bodyMarkdown: 'The wiki will undergo maintenance on **December 15th from 2-4 AM PST**. Editing will be temporarily disabled.',
  //   severity: 'warn',
  //   createdAt: new Date().toISOString(),
  //   expiresAt: '2025-12-16T00:00:00Z',
  //   dismissible: false,
  //   targetRoles: 'all',
  // },
  // Uncomment to test critical bulletin (admin-only):
  // {
  //   id: 'bulletin-security',
  //   title: 'Security Update Required',
  //   bodyMarkdown: 'Please review and update your password. [Change Password](/settings/security)',
  //   severity: 'critical',
  //   createdAt: new Date().toISOString(),
  //   expiresAt: null,
  //   dismissible: false,
  //   targetRoles: ['admin', 'editor'],
  // },
];

// =============================================================================
// BULLETIN RETRIEVAL FUNCTIONS
// =============================================================================

/**
 * Check if a bulletin has expired
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
 * Returns the highest-priority non-expired bulletin, or null if none apply.
 *
 * Priority order: critical > warn > info
 *
 * @param role - The user's wiki role
 * @returns The most relevant bulletin or null
 */
export function getActiveSystemBulletin(role: WikiRole): SystemInjection | null {
  // Filter to non-expired bulletins that target this role
  const applicableBulletins = ACTIVE_BULLETINS.filter(
    (bulletin) => !isBulletinExpired(bulletin) && bulletinTargetsRole(bulletin, role)
  );

  if (applicableBulletins.length === 0) return null;

  // Sort by severity priority (critical first, then warn, then info)
  const severityOrder: Record<SystemInjection['severity'], number> = {
    critical: 0,
    warn: 1,
    info: 2,
  };

  applicableBulletins.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  // Return the highest priority bulletin
  return applicableBulletins[0];
}

/**
 * Get all active bulletins for a user (if multiple bulletins should be shown)
 *
 * @param role - The user's wiki role
 * @returns Array of applicable bulletins, sorted by severity
 */
export function getAllActiveBulletins(role: WikiRole): SystemInjection[] {
  const applicableBulletins = ACTIVE_BULLETINS.filter(
    (bulletin) => !isBulletinExpired(bulletin) && bulletinTargetsRole(bulletin, role)
  );

  const severityOrder: Record<SystemInjection['severity'], number> = {
    critical: 0,
    warn: 1,
    info: 2,
  };

  return applicableBulletins.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}

/**
 * Check if there are any active critical bulletins
 * Useful for showing urgent notifications in the header
 */
export function hasActiveCriticalBulletin(role: WikiRole): boolean {
  return ACTIVE_BULLETINS.some(
    (bulletin) =>
      bulletin.severity === 'critical' &&
      !isBulletinExpired(bulletin) &&
      bulletinTargetsRole(bulletin, role)
  );
}
