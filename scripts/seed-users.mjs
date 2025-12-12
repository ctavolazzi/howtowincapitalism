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
 */

import { execSync } from 'child_process';
import { createHash } from 'crypto';

// Check for --preview flag
const isPreview = process.argv.includes('--preview');

// Namespace IDs
const USERS_ID = isPreview
  ? '6a7210df39874497b8cac57b112484eb'  // preview
  : '5b575785cbaa4b9e90e324501799cd39'; // production

// Same hashing as kv-auth.ts (SHA-256 with salt)
function hashPassword(password) {
  const hash = createHash('sha256');
  hash.update(password + 'htwc_salt_2024');
  return hash.digest('hex');
}

// Test users - ROTATED 2024-12-10 after GitGuardian alert
const users = [
  {
    id: 'admin',
    email: 'admin@email.com',
    password: 'Adm!n_Secure_2024#',
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
    password: 'Ed!tor_Access_2024#',
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
    password: 'Contr!b_Pass_2024#',
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
    password: 'V!ewer_Read_2024#',
    name: 'Viewer User',
    role: 'viewer',
    accessLevel: 1,
    avatar: '/favicon.svg',
    bio: 'Read-only viewer.',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
];

console.log(`🌱 Seeding users to Cloudflare KV (${isPreview ? 'PREVIEW' : 'PRODUCTION'})...\n`);

for (const user of users) {
  // Hash the password
  const passwordHash = hashPassword(user.password);

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

console.log('🎉 Done! Users seeded to KV.');
console.log(`\nEnvironment: ${isPreview ? 'PREVIEW (local dev)' : 'PRODUCTION'}`);
console.log('\nTest credentials:');
console.log('  admin@email.com / Adm!n_Secure_2024#');
console.log('  editor@email.com / Ed!tor_Access_2024#');
console.log('  contributor@email.com / Contr!b_Pass_2024#');
console.log('  viewer@email.com / V!ewer_Read_2024#');
