/**
 * Shared Test Credentials
 *
 * DEVELOPMENT-ONLY credentials for E2E testing.
 * These are NOT production passwords.
 *
 * Production passwords are:
 * - Stored in Cloudflare environment variables
 * - Seeded to KV via scripts/seed-users.mjs
 * - NEVER committed to the repository
 *
 * These simple passwords are intentionally obvious test values
 * that won't trigger secret detection tools.
 *
 * Password requirements: 8+ chars, letters, and numbers.
 */

export const TEST_CREDENTIALS = {
  admin: {
    email: 'admin@email.com',
    password: 'test_admin1',
    role: 'admin' as const,
  },
  editor: {
    email: 'editor@email.com',
    password: 'test_editor1',
    role: 'editor' as const,
  },
  contributor: {
    email: 'contributor@email.com',
    password: 'test_contrib1',
    role: 'contributor' as const,
  },
  viewer: {
    email: 'viewer@email.com',
    password: 'test_viewer1',
    role: 'viewer' as const,
  },
} as const;

// Site-wide password gate (from Base.astro)
export const SITE_PASSWORD = 'unlockmenow';

// Type exports for convenience
export type TestUserRole = keyof typeof TEST_CREDENTIALS;
export type TestUser = (typeof TEST_CREDENTIALS)[TestUserRole];


