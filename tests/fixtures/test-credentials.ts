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
 */

// pragma: allowlist nextline secret
export const TEST_CREDENTIALS = {
  admin: {
    email: 'admin@email.com',
    password: 'DevAdmin_Local_2024#', // pragma: allowlist secret
    role: 'admin' as const,
  },
  editor: {
    email: 'editor@email.com',
    password: 'DevEditor_Local_2024#', // pragma: allowlist secret
    role: 'editor' as const,
  },
  contributor: {
    email: 'contributor@email.com',
    password: 'DevContrib_Local_2024#', // pragma: allowlist secret
    role: 'contributor' as const,
  },
  viewer: {
    email: 'viewer@email.com',
    password: 'DevViewer_Local_2024#', // pragma: allowlist secret
    role: 'viewer' as const,
  },
} as const;

// Site-wide password gate (from Base.astro)
export const SITE_PASSWORD = 'unlockmenow';

// Type exports for convenience
export type TestUserRole = keyof typeof TEST_CREDENTIALS;
export type TestUser = (typeof TEST_CREDENTIALS)[TestUserRole];
