/**
 * User Profile Schema
 *
 * Production-ready data contract for Wiki Contributors.
 * This extends the basic auth user with wiki-specific features:
 * - Reputation system (badges, scores)
 * - System injection (global bulletins)
 * - Activity stream (edit history)
 * - User preferences
 */

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * User role within the wiki system
 */
export type WikiRole = 'admin' | 'editor' | 'contributor' | 'viewer';

/**
 * Badge types that can be earned
 */
export type BadgeType =
  | 'founder'           // Original site creator
  | 'early_adopter'     // Joined in first month
  | 'prolific_editor'   // 100+ edits
  | 'fact_checker'      // Verified 50+ claims
  | 'community_helper'  // Helped 25+ users
  | 'streak_7'          // 7-day edit streak
  | 'streak_30'         // 30-day edit streak
  | 'first_article'     // Created first article
  | 'thousand_words';   // Added 1000+ words total

/**
 * User badge with earned timestamp
 */
export interface Badge {
  type: BadgeType;
  earnedAt: string; // ISO timestamp
  description: string;
}

/**
 * Core identity data
 */
export interface UserIdentity {
  id: string;                    // UUID, matches content/users/[id].md
  username: string;              // Display name
  email: string;                 // Login email
  avatarUrl: string;             // Profile image
  role: WikiRole;                // Permission role
  accessLevel: number;           // Numeric access (1-10)
  joinedAt: string;              // ISO timestamp
  lastActiveAt: string;          // ISO timestamp
  reputationScore: number;       // Wiki reputation points
  badges: Badge[];               // Earned badges
  bio: string;                   // User bio/description
  isActive: boolean;             // Account active status
}

/**
 * System injection for global announcements
 * Admins can inject messages into all user dashboards
 */
export interface SystemInjection {
  id: string;                    // Unique bulletin ID
  title: string;                 // Bulletin title
  bodyMarkdown: string;          // Content (supports markdown)
  severity: 'info' | 'warn' | 'critical';
  createdAt: string;             // ISO timestamp
  expiresAt: string | null;      // Auto-dismiss after this time
  dismissible: boolean;          // Can user dismiss?
  targetRoles: WikiRole[] | 'all'; // Who sees this
}

/**
 * Activity event types
 */
export type ActivityType =
  | 'edit'        // Edited existing page
  | 'create'      // Created new page
  | 'comment'     // Added comment
  | 'review'      // Reviewed edit
  | 'badge'       // Earned badge
  | 'login'       // Logged in
  | 'profile';    // Updated profile

/**
 * Target page reference
 */
export interface PageReference {
  title: string;
  slug: string;
  section?: string; // Optional section anchor
}

/**
 * Activity metadata (varies by type)
 */
export interface ActivityMeta {
  wordsDelta?: number;           // +/- words changed
  diffUrl?: string;              // Link to diff view
  badgeType?: BadgeType;         // For badge events
  reviewResult?: 'approved' | 'rejected';
  comment?: string;              // Brief note
}

/**
 * Single activity log entry
 */
export interface ActivityEvent {
  id: string;                    // Unique event ID
  type: ActivityType;
  timestamp: string;             // ISO timestamp
  targetPage?: PageReference;    // Affected page (if applicable)
  meta: ActivityMeta;
}

/**
 * User preferences
 */
export interface UserPreferences {
  theme: 'system' | 'light' | 'dark' | 'retro';
  publicEmail: boolean;          // Show email on profile?
  publicActivity: boolean;       // Show activity on profile?
  emailNotifications: boolean;   // Receive email updates?
  compactMode: boolean;          // Dense UI layout?
}

/**
 * Complete User Profile
 * The full data contract for a Wiki Contributor
 */
export interface UserProfile {
  identity: UserIdentity;
  systemInjection: SystemInjection | null;
  activityLog: ActivityEvent[];
  preferences: UserPreferences;
  stats: UserStats;
}

/**
 * Aggregated user statistics
 */
export interface UserStats {
  totalEdits: number;
  totalCreations: number;
  totalWordsAdded: number;
  currentStreak: number;         // Days
  longestStreak: number;         // Days
  lastEditAt: string | null;     // ISO timestamp
}

// =============================================================================
// MOCK DATA - REALISTIC WIKI CONTRIBUTORS
// =============================================================================

/**
 * Helper to generate ISO timestamps
 */
function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

/**
 * Full mock profile for the admin user (CapitalismHacker)
 */
export const MOCK_FULL_PROFILE: UserProfile = {
  identity: {
    id: 'crispy',
    username: 'CapitalismHacker',
    email: 'admin@email.com',
    avatarUrl: '/favicon.svg',
    role: 'admin',
    accessLevel: 10,
    joinedAt: '2025-01-01T00:00:00Z',
    lastActiveAt: hoursAgo(0.5),
    reputationScore: 4250,
    badges: [
      {
        type: 'founder',
        earnedAt: '2025-01-01T00:00:00Z',
        description: 'Founded the How To Win Capitalism wiki',
      },
      {
        type: 'prolific_editor',
        earnedAt: '2025-06-15T10:30:00Z',
        description: 'Made 100+ edits to the wiki',
      },
      {
        type: 'streak_30',
        earnedAt: '2025-09-01T00:00:00Z',
        description: 'Maintained a 30-day editing streak',
      },
      {
        type: 'thousand_words',
        earnedAt: '2025-03-20T14:22:00Z',
        description: 'Contributed 1,000+ words to the wiki',
      },
    ],
    bio: 'Primary operator of the NovaSystem. Building tools for financial autonomy.',
    isActive: true,
  },

  systemInjection: {
    id: 'bulletin-v1',
    title: '🎉 Welcome to v1.0',
    bodyMarkdown: 'The How To Win Capitalism wiki is now live! Check out the [FAQ](/faq/) to get started.',
    severity: 'info',
    createdAt: daysAgo(1),
    expiresAt: null,
    dismissible: true,
    targetRoles: 'all',
  },

  activityLog: [
    {
      id: 'act-001',
      type: 'edit',
      timestamp: hoursAgo(2),
      targetPage: {
        title: 'Compound Interest',
        slug: 'faq/compound-interest',
        section: 'the-rule-of-72',
      },
      meta: {
        wordsDelta: 450,
        comment: 'Added Rule of 72 calculator example',
      },
    },
    {
      id: 'act-002',
      type: 'create',
      timestamp: hoursAgo(8),
      targetPage: {
        title: 'Tax Optimization Guide',
        slug: 'tools/tax-optimization-guide',
      },
      meta: {
        wordsDelta: 1200,
        comment: 'New comprehensive tax guide',
      },
    },
    {
      id: 'act-003',
      type: 'edit',
      timestamp: daysAgo(1),
      targetPage: {
        title: 'Emergency Fund',
        slug: 'faq/emergency-fund',
      },
      meta: {
        wordsDelta: 85,
        comment: 'Updated recommended amount',
      },
    },
    {
      id: 'act-004',
      type: 'badge',
      timestamp: daysAgo(2),
      meta: {
        badgeType: 'streak_30',
        comment: 'Achieved 30-day editing streak!',
      },
    },
    {
      id: 'act-005',
      type: 'review',
      timestamp: daysAgo(3),
      targetPage: {
        title: 'Debt Strategies',
        slug: 'faq/debt-strategies',
      },
      meta: {
        reviewResult: 'approved',
        comment: 'Good addition on avalanche method',
      },
    },
    {
      id: 'act-006',
      type: 'edit',
      timestamp: daysAgo(4),
      targetPage: {
        title: 'Investment Allocation',
        slug: 'faq/investment-allocation',
      },
      meta: {
        wordsDelta: 320,
      },
    },
    {
      id: 'act-007',
      type: 'login',
      timestamp: hoursAgo(0.5),
      meta: {},
    },
  ],

  preferences: {
    theme: 'system',
    publicEmail: false,
    publicActivity: true,
    emailNotifications: true,
    compactMode: false,
  },

  stats: {
    totalEdits: 127,
    totalCreations: 15,
    totalWordsAdded: 28450,
    currentStreak: 32,
    longestStreak: 45,
    lastEditAt: hoursAgo(2),
  },
};

/**
 * Mock profile for editor user
 */
export const MOCK_EDITOR_PROFILE: UserProfile = {
  identity: {
    id: 'editor',
    username: 'WikiEditor',
    email: 'editor@email.com',
    avatarUrl: '/favicon.svg',
    role: 'editor',
    accessLevel: 5,
    joinedAt: '2025-03-15T00:00:00Z',
    lastActiveAt: hoursAgo(4),
    reputationScore: 1820,
    badges: [
      {
        type: 'early_adopter',
        earnedAt: '2025-03-15T00:00:00Z',
        description: 'Joined in the first month',
      },
      {
        type: 'fact_checker',
        earnedAt: '2025-08-10T09:15:00Z',
        description: 'Verified 50+ claims',
      },
    ],
    bio: 'Content editor focused on accuracy and clarity.',
    isActive: true,
  },

  systemInjection: {
    id: 'bulletin-v1',
    title: '🎉 Welcome to v1.0',
    bodyMarkdown: 'The How To Win Capitalism wiki is now live!',
    severity: 'info',
    createdAt: daysAgo(1),
    expiresAt: null,
    dismissible: true,
    targetRoles: 'all',
  },

  activityLog: [
    {
      id: 'ed-001',
      type: 'edit',
      timestamp: hoursAgo(4),
      targetPage: {
        title: 'Income Streams',
        slug: 'faq/income-streams',
      },
      meta: {
        wordsDelta: 180,
        comment: 'Grammar and clarity fixes',
      },
    },
    {
      id: 'ed-002',
      type: 'review',
      timestamp: daysAgo(1),
      targetPage: {
        title: 'Career Decisions',
        slug: 'faq/career-decisions',
      },
      meta: {
        reviewResult: 'approved',
      },
    },
  ],

  preferences: {
    theme: 'light',
    publicEmail: false,
    publicActivity: true,
    emailNotifications: true,
    compactMode: true,
  },

  stats: {
    totalEdits: 89,
    totalCreations: 3,
    totalWordsAdded: 12300,
    currentStreak: 5,
    longestStreak: 21,
    lastEditAt: hoursAgo(4),
  },
};

/**
 * Mock profile for contributor user
 */
export const MOCK_CONTRIBUTOR_PROFILE: UserProfile = {
  identity: {
    id: 'contributor',
    username: 'NewContributor',
    email: 'contributor@email.com',
    avatarUrl: '/favicon.svg',
    role: 'contributor',
    accessLevel: 3,
    joinedAt: '2025-10-01T00:00:00Z',
    lastActiveAt: daysAgo(2),
    reputationScore: 250,
    badges: [
      {
        type: 'first_article',
        earnedAt: '2025-10-15T16:45:00Z',
        description: 'Created their first article',
      },
    ],
    bio: 'Learning about financial independence.',
    isActive: true,
  },

  systemInjection: {
    id: 'bulletin-v1',
    title: '🎉 Welcome to v1.0',
    bodyMarkdown: 'The How To Win Capitalism wiki is now live!',
    severity: 'info',
    createdAt: daysAgo(1),
    expiresAt: null,
    dismissible: true,
    targetRoles: 'all',
  },

  activityLog: [
    {
      id: 'con-001',
      type: 'create',
      timestamp: daysAgo(2),
      targetPage: {
        title: 'Negotiation Tactics',
        slug: 'notes/negotiation-tactics',
      },
      meta: {
        wordsDelta: 650,
        comment: 'My first contribution!',
      },
    },
  ],

  preferences: {
    theme: 'system',
    publicEmail: false,
    publicActivity: true,
    emailNotifications: false,
    compactMode: false,
  },

  stats: {
    totalEdits: 3,
    totalCreations: 1,
    totalWordsAdded: 950,
    currentStreak: 0,
    longestStreak: 3,
    lastEditAt: daysAgo(2),
  },
};

/**
 * Mock profile for viewer user
 */
export const MOCK_VIEWER_PROFILE: UserProfile = {
  identity: {
    id: 'viewer',
    username: 'CuriousReader',
    email: 'viewer@email.com',
    avatarUrl: '/favicon.svg',
    role: 'viewer',
    accessLevel: 1,
    joinedAt: '2025-11-20T00:00:00Z',
    lastActiveAt: daysAgo(5),
    reputationScore: 10,
    badges: [],
    bio: 'Just browsing.',
    isActive: true,
  },

  systemInjection: null, // No bulletin for this user

  activityLog: [
    {
      id: 'view-001',
      type: 'login',
      timestamp: daysAgo(5),
      meta: {},
    },
  ],

  preferences: {
    theme: 'dark',
    publicEmail: false,
    publicActivity: false,
    emailNotifications: false,
    compactMode: false,
  },

  stats: {
    totalEdits: 0,
    totalCreations: 0,
    totalWordsAdded: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastEditAt: null,
  },
};

// =============================================================================
// PROFILE LOOKUP MAP
// =============================================================================

/**
 * All mock profiles indexed by user ID
 */
export const MOCK_PROFILES: Record<string, UserProfile> = {
  crispy: MOCK_FULL_PROFILE,
  editor: MOCK_EDITOR_PROFILE,
  contributor: MOCK_CONTRIBUTOR_PROFILE,
  viewer: MOCK_VIEWER_PROFILE,
};

/**
 * Get mock profile by user ID
 */
export function getMockProfile(userId: string): UserProfile | null {
  return MOCK_PROFILES[userId] || null;
}
