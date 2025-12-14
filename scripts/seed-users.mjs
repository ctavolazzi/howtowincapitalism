#!/usr/bin/env node
/**
 * Seed Users to Cloudflare KV
 *
 * Run: node scripts/seed-users.mjs [--preview]
 *
 * This script hashes passwords and uploads users to KV.
 * Uses wrangler CLI to write to KV.
 *
 * --preview: Seed to preview namespace (for local dev)
 *
 * SECURITY:
 * - Production passwords are read from environment variables (set in Cloudflare)
 * - Development passwords are hardcoded fallbacks for local testing only
 * - NEVER commit production passwords to the repository
 */

import { execSync } from 'child_process';
import { pbkdf2Sync, randomBytes } from 'crypto';

// Check for --preview flag
const isPreview = process.argv.includes('--preview');

// Namespace IDs
const USERS_ID = isPreview
  ? '6a7210df39874497b8cac57b112484eb'  // preview
  : '5b575785cbaa4b9e90e324501799cd39'; // production

// PBKDF2 Configuration (must match kv-auth.ts)
const PBKDF2_ITERATIONS = 100000;
const PBKDF2_SALT_LENGTH = 16; // 16 bytes = 128 bits
const PBKDF2_KEY_LENGTH = 32; // 32 bytes = 256 bits

/**
 * V2 password hashing using PBKDF2 with per-user random salt
 * Format: v2:${iterations}:${saltHex}:${hashHex}
 */
function hashPasswordV2(password) {
  // Generate random salt
  const salt = randomBytes(PBKDF2_SALT_LENGTH);

  // Derive key using PBKDF2
  const derivedKey = pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEY_LENGTH, 'sha256');

  const hashHex = derivedKey.toString('hex');
  const saltHex = salt.toString('hex');

  return `v2:${PBKDF2_ITERATIONS}:${saltHex}:${hashHex}`;
}

// =============================================================================
// PASSWORD CONFIGURATION
// Production: Read from environment variables (set in Cloudflare Dashboard)
// Development: Use fallback passwords for local testing
// =============================================================================

// Development-only passwords (safe to commit - NOT used in production)
// pragma: allowlist secret
const DEV_PASSWORDS = {
  admin: 'test_admin1',
  editor: 'test_editor1',   
  contributor: 'test_contrib1',
  viewer: 'test_viewer1',   
};

// Get password for a role (production from env, dev from fallback)
function getPassword(role) {
  const envVar = `SEED_${role.toUpperCase()}_PASSWORD`;
  const envPassword = process.env[envVar];

  if (!isPreview && !envPassword) {
    console.error(`⚠️  Warning: ${envVar} not set. Using development password.`);
    console.error(`   For production, set ${envVar} in Cloudflare environment variables.`);
  }

  return envPassword || DEV_PASSWORDS[role];
}

// User definitions (passwords resolved at runtime)
const users = [
  {
    id: 'admin',
    email: 'admin@email.com',
    name: 'Admin User',
    role: 'admin',
    accessLevel: 10,
    avatar: '/favicon.svg',
    bio: 'Site administrator with full access.',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'editor',
    email: 'editor@email.com',
    name: 'Editor User',
    role: 'editor',
    accessLevel: 5,
    avatar: '/favicon.svg',
    bio: 'Content editor with write access.',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'contributor',
    email: 'contributor@email.com',
    name: 'Contributor User',
    role: 'contributor',
    accessLevel: 3,
    avatar: '/favicon.svg',
    bio: 'Contributor with limited access.',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'viewer',
    email: 'viewer@email.com',
    name: 'Viewer User',
    role: 'viewer',
    accessLevel: 1,
    avatar: '/favicon.svg',
    bio: 'Read-only viewer.',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
];

console.log(`🌱 Seeding users to Cloudflare KV (${isPreview ? 'PREVIEW' : 'PRODUCTION'})...\n`);

if (!isPreview) {
  console.log('🔐 Production mode: Reading passwords from environment variables\n');
}

for (const user of users) {
  // Get password (from env or fallback)
  const password = getPassword(user.id);

  // Hash the password using PBKDF2 (V2 format)
  const passwordHash = hashPasswordV2(password);

  // Create user object (without plaintext password)
  const userData = {
    id: user.id,
    email: user.email,
    passwordHash,
    name: user.name,
    role: user.role,
    accessLevel: user.accessLevel,
    avatar: user.avatar,
    bio: user.bio,
    createdAt: user.createdAt,
    emailConfirmed: true, // Seed users are pre-confirmed
  };

  // Write user data
  const userKey = `user:${user.id}`;
  const userValue = JSON.stringify(userData);

  try {
    execSync(
      `wrangler kv key put --namespace-id=${USERS_ID} --remote "${userKey}" '${userValue.replace(/'/g, "'\\''")}'`,
      { stdio: 'pipe' }
    );
    console.log(`✅ Created user: ${user.id} (${user.email})`);
  } catch (error) {
    console.error(`❌ Failed to create user ${user.id}:`, error.message);
  }

  // Write email index
  const emailKey = `email:${user.email.toLowerCase()}`;

  try {
    execSync(
      `wrangler kv key put --namespace-id=${USERS_ID} --remote "${emailKey}" "${user.id}"`,
      { stdio: 'pipe' }
    );
    console.log(`✅ Created email index: ${user.email} → ${user.id}`);
  } catch (error) {
    console.error(`❌ Failed to create email index for ${user.email}:`, error.message);
  }

  console.log('');
}

console.log('🎉 Done! Users seeded to KV with PBKDF2 (V2) password hashing.');
console.log(`\nEnvironment: ${isPreview ? 'PREVIEW (local dev)' : 'PRODUCTION'}`);

if (isPreview) {
  console.log('\n📋 Development credentials (for local testing only):');
  console.log('  admin@email.com / test_admin1');
  console.log('  editor@email.com / test_editor1');
  console.log('  contributor@email.com / test_contrib1');
  console.log('  viewer@email.com / test_viewer1');
} else {
  console.log('\n🔐 Production credentials are stored in Cloudflare environment variables.');
  console.log('   See Cloudflare Dashboard > Pages > Settings > Environment variables');
}
