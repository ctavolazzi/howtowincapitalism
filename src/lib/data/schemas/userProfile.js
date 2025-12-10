/**
 * User Profile Schema - Wiki Contributor Data Contract
 *
 * This module defines the comprehensive data model for a Wiki Contributor
 * in the "How To Win Capitalism" knowledge base. It follows a production-ready
 * JSON Schema approach using JSDoc typedefs for TypeScript compatibility.
 *
 * Architecture:
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │                      WIKI CONTRIBUTOR PROFILE                               │
 * ├─────────────────────────────────────────────────────────────────────────────┤
 * │  identity          │ Core user data + wiki reputation metrics              │
 * │  systemInjection   │ Admin-controlled global bulletins/announcements       │
 * │  activityLog       │ Contribution history (edits, creates, comments)       │
 * │  preferences       │ User settings (theme, privacy, notifications)         │
 * └─────────────────────────────────────────────────────────────────────────────┘
 *
 * @module userProfile
 * @author How To Win Capitalism Team
 */

// =============================================================================
// TYPE DEFINITIONS (JSDoc + TypeScript-compatible)
// =============================================================================

/**
 * User roles in the wiki system with hierarchical access levels
 * @typedef {'admin' | 'editor' | 'contributor' | 'reader'} UserRole
 */

/**
 * Badge types that users can earn through contributions
 * @typedef {'founder' | 'early_adopter' | 'top_contributor' | 'fact_checker' | 'mentor' | 'wiki_guardian' | 'first_edit' | 'hundred_edits' | 'thousand_edits'} BadgeType
 */

/**
 * A badge earned by a user
 * @typedef {Object} Badge
 * @property {BadgeType} type - The badge identifier
 * @property {string} name - Human-readable badge name
 * @property {string} description - What this badge represents
 * @property {string} earnedAt - ISO 8601 timestamp when badge was earned
 * @property {string} [iconUrl] - Optional custom icon URL
 */

/**
 * Core identity data for a wiki contributor
 * @typedef {Object} UserIdentity
 * @property {string} uuid - Unique identifier (UUID v4 format)
 * @property {string} username - Display username (unique, URL-safe)
 * @property {string} displayName - Full display name
 * @property {string} avatarUrl - URL to avatar image (supports fallback to initials)
 * @property {UserRole} role - User's role in the wiki system
 * @property {number} accessLevel - Numeric access level (1-10)
 * @property {number} reputationScore - Wiki reputation points (0+)
 * @property {Badge[]} badges - Array of earned badges
 * @property {string} joinedAt - ISO 8601 timestamp of account creation
 * @property {string} lastActiveAt - ISO 8601 timestamp of last activity
 * @property {string} [location] - Optional location string
 * @property {string} [website] - Optional personal website URL
 * @property {string} bio - User biography/description
 */

/**
 * Severity levels for system bulletins
 * @typedef {'info' | 'warn' | 'critical'} BulletinSeverity
 */

/**
 * System-injected bulletin/announcement
 * Admin-controlled messages that appear on user dashboards
 * @typedef {Object} SystemBulletin
 * @property {string} id - Unique bulletin identifier
 * @property {string} title - Bulletin headline
 * @property {string} bodyMarkdown - Markdown-formatted content
 * @property {BulletinSeverity} severity - Visual importance level
 * @property {string} createdAt - ISO 8601 timestamp
 * @property {string} [expiresAt] - Optional expiration timestamp
 * @property {boolean} dismissible - Whether user can dismiss this bulletin
 * @property {string} [actionUrl] - Optional call-to-action link
 * @property {string} [actionLabel] - Label for the action button
 */

/**
 * System injection payload (can contain multiple bulletins)
 * @typedef {Object} SystemInjection
 * @property {SystemBulletin[]} bulletins - Active bulletins to display
 * @property {string} lastUpdated - When injection data was last updated
 */

/**
 * Types of activity events in the wiki
 * @typedef {'edit' | 'create' | 'comment' | 'review' | 'delete' | 'restore'} ActivityEventType
 */

/**
 * Target page reference for an activity event
 * @typedef {Object} TargetPage
 * @property {string} title - Page title
 * @property {string} slug - URL-safe page identifier
 * @property {string} [section] - Optional section anchor within the page
 */

/**
 * Metadata for an activity event
 * @typedef {Object} ActivityMeta
 * @property {string} [wordDelta] - Word count change (e.g., "+450 words", "-23 words")
 * @property {number} [byteDelta] - Byte count change
 * @property {string} [editSummary] - User's edit summary/commit message
 * @property {string} [previousRevision] - ID of the previous revision
 * @property {string} [newRevision] - ID of the new revision
 * @property {boolean} [isMinorEdit] - Whether this was flagged as a minor edit
 * @property {string[]} [tags] - Tags applied to this edit
 */

/**
 * A single activity event in the user's contribution history
 * @typedef {Object} ActivityEvent
 * @property {string} id - Unique event identifier
 * @property {ActivityEventType} type - Type of activity
 * @property {TargetPage} targetPage - The page this activity affected
 * @property {string} timestamp - ISO 8601 timestamp of the event
 * @property {ActivityMeta} meta - Additional event metadata
 */

/**
 * User preferences and settings
 * @typedef {Object} UserPreferences
 * @property {'system' | 'light' | 'dark' | 'retro'} theme - UI theme preference
 * @property {boolean} publicEmail - Whether to display email publicly
 * @property {boolean} publicActivity - Whether activity feed is public
 * @property {boolean} emailNotifications - Receive email notifications
 * @property {boolean} mentionNotifications - Notify on @mentions
 * @property {string} timezone - User's timezone (IANA format)
 * @property {string} locale - Preferred locale (e.g., 'en-US')
 */

/**
 * Contribution statistics for a wiki contributor
 * @typedef {Object} ContributionStats
 * @property {number} totalEdits - Total number of edits made
 * @property {number} pagesCreated - Number of new pages created
 * @property {number} commentsPosted - Number of comments posted
 * @property {number} reviewsCompleted - Number of peer reviews completed
 * @property {number} consecutiveDays - Current edit streak in days
 * @property {number} longestStreak - Longest ever edit streak
 * @property {string} firstContribution - ISO 8601 timestamp of first edit
 * @property {string} lastContribution - ISO 8601 timestamp of most recent edit
 */

/**
 * Complete Wiki Contributor Profile
 * The full data contract for a user profile in the system
 * @typedef {Object} WikiContributorProfile
 * @property {UserIdentity} identity - Core identity information
 * @property {SystemInjection | null} systemInjection - Admin-injected bulletins (null if none)
 * @property {ActivityEvent[]} activityLog - Recent contribution history
 * @property {UserPreferences} preferences - User settings
 * @property {ContributionStats} stats - Contribution statistics
 * @property {string} _fetchedAt - ISO 8601 timestamp when this data was fetched
 * @property {string} _version - Schema version for backwards compatibility
 */

// =============================================================================
// SCHEMA VERSION
// =============================================================================

/**
 * Current schema version - increment on breaking changes
 * @constant {string}
 */
export const SCHEMA_VERSION = '1.0.0';

// =============================================================================
// BADGE DEFINITIONS
// =============================================================================

/**
 * Available badge definitions
 * @type {Record<BadgeType, Omit<Badge, 'earnedAt'>>}
 */
export const BADGE_DEFINITIONS = {
  founder: {
    type: 'founder',
    name: 'Founder',
    description: 'Founding member of the How To Win Capitalism wiki',
    iconUrl: '/badges/founder.svg',
  },
  early_adopter: {
    type: 'early_adopter',
    name: 'Early Adopter',
    description: 'Joined within the first 100 users',
    iconUrl: '/badges/early-adopter.svg',
  },
  top_contributor: {
    type: 'top_contributor',
    name: 'Top Contributor',
    description: 'Among the top 10 contributors this month',
    iconUrl: '/badges/top-contributor.svg',
  },
  fact_checker: {
    type: 'fact_checker',
    name: 'Fact Checker',
    description: 'Verified accuracy of 50+ claims',
    iconUrl: '/badges/fact-checker.svg',
  },
  mentor: {
    type: 'mentor',
    name: 'Mentor',
    description: 'Helped 10+ new contributors get started',
    iconUrl: '/badges/mentor.svg',
  },
  wiki_guardian: {
    type: 'wiki_guardian',
    name: 'Wiki Guardian',
    description: 'Protected the wiki from spam and vandalism',
    iconUrl: '/badges/guardian.svg',
  },
  first_edit: {
    type: 'first_edit',
    name: 'First Edit',
    description: 'Made your first contribution',
    iconUrl: '/badges/first-edit.svg',
  },
  hundred_edits: {
    type: 'hundred_edits',
    name: 'Century',
    description: 'Reached 100 edits',
    iconUrl: '/badges/century.svg',
  },
  thousand_edits: {
    type: 'thousand_edits',
    name: 'Millennium',
    description: 'Reached 1,000 edits',
    iconUrl: '/badges/millennium.svg',
  },
};

// =============================================================================
// MOCK DATA - FULL WIKI CONTRIBUTOR PROFILE
// =============================================================================

/**
 * Mock full profile for testing and development
 * Represents a realistic wiki power user named "CapitalismHacker"
 * @type {WikiContributorProfile}
 */
export const MOCK_FULL_PROFILE = {
  identity: {
    uuid: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    username: 'CapitalismHacker',
    displayName: 'Alex Chen',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CapitalismHacker',
    role: 'editor',
    accessLevel: 5,
    reputationScore: 2847,
    badges: [
      {
        type: 'early_adopter',
        name: 'Early Adopter',
        description: 'Joined within the first 100 users',
        earnedAt: '2025-01-15T10:30:00Z',
        iconUrl: '/badges/early-adopter.svg',
      },
      {
        type: 'top_contributor',
        name: 'Top Contributor',
        description: 'Among the top 10 contributors this month',
        earnedAt: '2025-11-01T00:00:00Z',
        iconUrl: '/badges/top-contributor.svg',
      },
      {
        type: 'hundred_edits',
        name: 'Century',
        description: 'Reached 100 edits',
        earnedAt: '2025-06-22T14:15:00Z',
        iconUrl: '/badges/century.svg',
      },
      {
        type: 'fact_checker',
        name: 'Fact Checker',
        description: 'Verified accuracy of 50+ claims',
        earnedAt: '2025-09-10T09:00:00Z',
        iconUrl: '/badges/fact-checker.svg',
      },
    ],
    joinedAt: '2025-01-15T10:30:00Z',
    lastActiveAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    location: 'San Francisco, CA',
    website: 'https://alexchen.dev',
    bio: 'Financial independence enthusiast and open-source contributor. I believe in democratizing financial knowledge. Currently focused on documenting compound interest strategies and tax optimization techniques.',
  },

  systemInjection: {
    bulletins: [
      {
        id: 'bulletin-welcome-v1',
        title: 'Welcome to How To Win Capitalism v1.0!',
        bodyMarkdown:
          "We've officially launched! Thank you for being part of our community. Check out the [Getting Started Guide](/docs/getting-started) to learn how to contribute.\n\n**New features:**\n- Real-time collaboration\n- Improved search\n- Mobile-friendly editor",
        severity: 'info',
        createdAt: '2025-12-01T00:00:00Z',
        expiresAt: '2025-12-31T23:59:59Z',
        dismissible: true,
        actionUrl: '/docs/getting-started',
        actionLabel: 'Get Started',
      },
    ],
    lastUpdated: '2025-12-01T00:00:00Z',
  },

  activityLog: [
    {
      id: 'evt-001',
      type: 'edit',
      targetPage: {
        title: 'Compound Interest',
        slug: 'compound-interest',
        section: 'calculation-methods',
      },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      meta: {
        wordDelta: '+450 words',
        byteDelta: 2847,
        editSummary: 'Added detailed examples of monthly vs daily compounding with real-world scenarios',
        previousRevision: 'rev-a1b2c3',
        newRevision: 'rev-d4e5f6',
        isMinorEdit: false,
        tags: ['expansion', 'examples'],
      },
    },
    {
      id: 'evt-002',
      type: 'create',
      targetPage: {
        title: 'Tax Loss Harvesting',
        slug: 'tax-loss-harvesting',
      },
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      meta: {
        wordDelta: '+1,247 words',
        byteDelta: 8934,
        editSummary: 'New article: Comprehensive guide to tax loss harvesting strategies',
        newRevision: 'rev-g7h8i9',
        isMinorEdit: false,
        tags: ['new-article', 'taxes', 'investing'],
      },
    },
    {
      id: 'evt-003',
      type: 'edit',
      targetPage: {
        title: 'Emergency Fund',
        slug: 'emergency-fund',
        section: 'how-much-to-save',
      },
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      meta: {
        wordDelta: '+89 words',
        byteDelta: 612,
        editSummary: 'Updated recommended months of expenses based on 2025 data',
        previousRevision: 'rev-j1k2l3',
        newRevision: 'rev-m4n5o6',
        isMinorEdit: true,
        tags: ['update', 'statistics'],
      },
    },
    {
      id: 'evt-004',
      type: 'comment',
      targetPage: {
        title: 'Index Fund Investing',
        slug: 'index-fund-investing',
        section: 'discussion',
      },
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      meta: {
        editSummary: 'Replied to discussion about international vs domestic index allocation',
        tags: ['discussion'],
      },
    },
    {
      id: 'evt-005',
      type: 'review',
      targetPage: {
        title: 'Roth IRA Conversion',
        slug: 'roth-ira-conversion',
      },
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      meta: {
        editSummary: 'Approved changes with minor suggestions for clarity',
        tags: ['peer-review', 'approved'],
      },
    },
  ],

  preferences: {
    theme: 'system',
    publicEmail: false,
    publicActivity: true,
    emailNotifications: true,
    mentionNotifications: true,
    timezone: 'America/Los_Angeles',
    locale: 'en-US',
  },

  stats: {
    totalEdits: 247,
    pagesCreated: 12,
    commentsPosted: 89,
    reviewsCompleted: 34,
    consecutiveDays: 15,
    longestStreak: 42,
    firstContribution: '2025-01-20T18:45:00Z',
    lastContribution: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },

  _fetchedAt: new Date().toISOString(),
  _version: SCHEMA_VERSION,
};

// =============================================================================
// ADDITIONAL MOCK PROFILES FOR TESTING
// =============================================================================

/**
 * Mock profile for testing admin user view
 * @type {WikiContributorProfile}
 */
export const MOCK_ADMIN_PROFILE = {
  identity: {
    uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    username: 'WikiFounder',
    displayName: 'Christopher Tavolazzi',
    avatarUrl: '/favicon.svg',
    role: 'admin',
    accessLevel: 10,
    reputationScore: 10000,
    badges: [
      {
        type: 'founder',
        name: 'Founder',
        description: 'Founding member of the How To Win Capitalism wiki',
        earnedAt: '2025-01-01T00:00:00Z',
        iconUrl: '/badges/founder.svg',
      },
      {
        type: 'wiki_guardian',
        name: 'Wiki Guardian',
        description: 'Protected the wiki from spam and vandalism',
        earnedAt: '2025-02-01T00:00:00Z',
        iconUrl: '/badges/guardian.svg',
      },
      {
        type: 'thousand_edits',
        name: 'Millennium',
        description: 'Reached 1,000 edits',
        earnedAt: '2025-10-15T00:00:00Z',
        iconUrl: '/badges/millennium.svg',
      },
    ],
    joinedAt: '2025-01-01T00:00:00Z',
    lastActiveAt: new Date().toISOString(),
    location: 'The Internet',
    website: 'https://howtowincapitalism.wiki',
    bio: 'Creator of How To Win Capitalism. Building the definitive open-source guide to financial independence.',
  },

  systemInjection: {
    bulletins: [
      {
        id: 'bulletin-maintenance',
        title: 'Scheduled Maintenance Tonight',
        bodyMarkdown:
          'The wiki will undergo maintenance from **11 PM - 2 AM PST**. During this time, editing will be disabled but reading will remain available.',
        severity: 'warn',
        createdAt: new Date().toISOString(),
        dismissible: false,
      },
    ],
    lastUpdated: new Date().toISOString(),
  },

  activityLog: [
    {
      id: 'admin-evt-001',
      type: 'edit',
      targetPage: {
        title: 'Main Page',
        slug: 'index',
      },
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins ago
      meta: {
        wordDelta: '+23 words',
        byteDelta: 156,
        editSummary: 'Updated featured article for December',
        isMinorEdit: true,
        tags: ['maintenance'],
      },
    },
  ],

  preferences: {
    theme: 'dark',
    publicEmail: false,
    publicActivity: true,
    emailNotifications: true,
    mentionNotifications: true,
    timezone: 'America/Los_Angeles',
    locale: 'en-US',
  },

  stats: {
    totalEdits: 1247,
    pagesCreated: 89,
    commentsPosted: 456,
    reviewsCompleted: 234,
    consecutiveDays: 120,
    longestStreak: 180,
    firstContribution: '2025-01-01T00:00:00Z',
    lastContribution: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },

  _fetchedAt: new Date().toISOString(),
  _version: SCHEMA_VERSION,
};

/**
 * Mock profile for testing new/inactive reader
 * @type {WikiContributorProfile}
 */
export const MOCK_READER_PROFILE = {
  identity: {
    uuid: 'b2c3d4e5-f6g7-8901-bcde-fg2345678901',
    username: 'CuriousLearner',
    displayName: 'Jordan Smith',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CuriousLearner',
    role: 'reader',
    accessLevel: 1,
    reputationScore: 15,
    badges: [
      {
        type: 'first_edit',
        name: 'First Edit',
        description: 'Made your first contribution',
        earnedAt: '2025-12-05T14:30:00Z',
        iconUrl: '/badges/first-edit.svg',
      },
    ],
    joinedAt: '2025-12-01T09:00:00Z',
    lastActiveAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
    bio: 'Just started learning about personal finance. Excited to contribute!',
  },

  systemInjection: null, // No bulletins for this user

  activityLog: [
    {
      id: 'reader-evt-001',
      type: 'edit',
      targetPage: {
        title: 'Budgeting Basics',
        slug: 'budgeting-basics',
        section: 'tools',
      },
      timestamp: '2025-12-05T14:30:00Z',
      meta: {
        wordDelta: '+12 words',
        byteDelta: 78,
        editSummary: 'Fixed typo in spreadsheet formula',
        isMinorEdit: true,
        tags: ['typo-fix'],
      },
    },
  ],

  preferences: {
    theme: 'light',
    publicEmail: false,
    publicActivity: false,
    emailNotifications: false,
    mentionNotifications: true,
    timezone: 'America/New_York',
    locale: 'en-US',
  },

  stats: {
    totalEdits: 1,
    pagesCreated: 0,
    commentsPosted: 0,
    reviewsCompleted: 0,
    consecutiveDays: 0,
    longestStreak: 1,
    firstContribution: '2025-12-05T14:30:00Z',
    lastContribution: '2025-12-05T14:30:00Z',
  },

  _fetchedAt: new Date().toISOString(),
  _version: SCHEMA_VERSION,
};

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Validates that a profile object matches the expected schema structure
 * @param {unknown} profile - The profile object to validate
 * @returns {{ valid: boolean, errors: string[] }} Validation result
 */
export function validateProfile(profile) {
  const errors = [];

  if (!profile || typeof profile !== 'object') {
    return { valid: false, errors: ['Profile must be an object'] };
  }

  // Check required top-level fields
  const requiredFields = ['identity', 'activityLog', 'preferences', 'stats', '_version'];
  for (const field of requiredFields) {
    if (!(field in profile)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Validate identity
  if (profile.identity) {
    const identityRequired = [
      'uuid',
      'username',
      'displayName',
      'avatarUrl',
      'role',
      'accessLevel',
      'reputationScore',
      'badges',
      'joinedAt',
      'lastActiveAt',
      'bio',
    ];
    for (const field of identityRequired) {
      if (!(field in profile.identity)) {
        errors.push(`Missing identity field: ${field}`);
      }
    }

    // Validate role
    const validRoles = ['admin', 'editor', 'contributor', 'reader'];
    if (profile.identity.role && !validRoles.includes(profile.identity.role)) {
      errors.push(`Invalid role: ${profile.identity.role}`);
    }

    // Validate accessLevel
    if (
      profile.identity.accessLevel !== undefined &&
      (profile.identity.accessLevel < 1 || profile.identity.accessLevel > 10)
    ) {
      errors.push(`Access level must be between 1 and 10`);
    }
  }

  // Validate preferences
  if (profile.preferences) {
    const validThemes = ['system', 'light', 'dark', 'retro'];
    if (profile.preferences.theme && !validThemes.includes(profile.preferences.theme)) {
      errors.push(`Invalid theme: ${profile.preferences.theme}`);
    }
  }

  // Validate activityLog is an array
  if (profile.activityLog && !Array.isArray(profile.activityLog)) {
    errors.push('activityLog must be an array');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Creates an empty/default profile structure
 * Useful for initializing new users
 * @param {Partial<UserIdentity>} identity - Partial identity data
 * @returns {WikiContributorProfile} A new profile with defaults
 */
export function createEmptyProfile(identity) {
  const now = new Date().toISOString();

  return {
    identity: {
      uuid: identity.uuid || crypto.randomUUID(),
      username: identity.username || 'NewUser',
      displayName: identity.displayName || 'New User',
      avatarUrl: identity.avatarUrl || '',
      role: identity.role || 'reader',
      accessLevel: identity.accessLevel || 1,
      reputationScore: 0,
      badges: [],
      joinedAt: now,
      lastActiveAt: now,
      bio: identity.bio || '',
      location: identity.location,
      website: identity.website,
    },
    systemInjection: null,
    activityLog: [],
    preferences: {
      theme: 'system',
      publicEmail: false,
      publicActivity: true,
      emailNotifications: true,
      mentionNotifications: true,
      timezone: 'UTC',
      locale: 'en-US',
    },
    stats: {
      totalEdits: 0,
      pagesCreated: 0,
      commentsPosted: 0,
      reviewsCompleted: 0,
      consecutiveDays: 0,
      longestStreak: 0,
      firstContribution: '',
      lastContribution: '',
    },
    _fetchedAt: now,
    _version: SCHEMA_VERSION,
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  SCHEMA_VERSION,
  BADGE_DEFINITIONS,
  MOCK_FULL_PROFILE,
  MOCK_ADMIN_PROFILE,
  MOCK_READER_PROFILE,
  validateProfile,
  createEmptyProfile,
};
