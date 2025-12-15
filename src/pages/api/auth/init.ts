/**
 * POST /api/auth/init
 *
 * Initialize seed users using Cloudflare environment variables.
 * This is the proper way - secrets stay in Cloudflare, never in code.
 *
 * Call this once after deployment to seed users:
 *   curl -X POST https://yoursite.pages.dev/api/auth/init/
 *
 * Requires SEED_ADMIN_PASSWORD (and optionally other SEED_*_PASSWORD vars)
 * to be set in Cloudflare Pages > Settings > Environment Variables.
 */
import type { APIRoute } from 'astro';
import { hashPasswordV2, getUserByEmail } from '../../../lib/auth/kv-auth';

interface SeedUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'contributor' | 'viewer';
  accessLevel: number;
  avatar: string;
  bio: string;
}

const SEED_USERS: SeedUser[] = [
  {
    id: 'admin',
    email: 'admin@email.com',
    name: 'Admin User',
    role: 'admin',
    accessLevel: 10,
    avatar: '/favicon.svg',
    bio: 'Site administrator with full access.',
  },
  {
    id: 'editor',
    email: 'editor@email.com',
    name: 'Editor User',
    role: 'editor',
    accessLevel: 5,
    avatar: '/favicon.svg',
    bio: 'Content editor with write access.',
  },
  {
    id: 'contributor',
    email: 'contributor@email.com',
    name: 'Contributor User',
    role: 'contributor',
    accessLevel: 3,
    avatar: '/favicon.svg',
    bio: 'Contributor with limited write access.',
  },
  {
    id: 'viewer',
    email: 'viewer@email.com',
    name: 'Viewer User',
    role: 'viewer',
    accessLevel: 1,
    avatar: '/favicon.svg',
    bio: 'Read-only viewer.',
  },
];

export const POST: APIRoute = async ({ locals }) => {
  try {
    const runtime = (locals as Record<string, unknown>).runtime as {
      env?: {
        USERS?: KVNamespace;
        SEED_ADMIN_PASSWORD?: string;
        SEED_EDITOR_PASSWORD?: string;
        SEED_CONTRIBUTOR_PASSWORD?: string;
        SEED_VIEWER_PASSWORD?: string;
      };
    };

    const USERS = runtime?.env?.USERS;
    if (!USERS) {
      return new Response(
        JSON.stringify({ error: 'KV not available. Are you on Cloudflare?' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if at least admin password is set
    const adminPassword = runtime?.env?.SEED_ADMIN_PASSWORD;
    if (!adminPassword) {
      return new Response(
        JSON.stringify({
          error: 'SEED_ADMIN_PASSWORD not set in Cloudflare environment variables.',
          instructions: [
            '1. Go to Cloudflare Dashboard > Workers & Pages > howtowincapitalism',
            '2. Click Settings > Variables and Secrets',
            '3. Add a new secret: SEED_ADMIN_PASSWORD = YourSecurePassword',
            '4. Call this endpoint again',
          ],
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get passwords from env vars (fall back to admin password if others not set)
    const passwords: Record<string, string> = {
      admin: adminPassword,
      editor: runtime?.env?.SEED_EDITOR_PASSWORD || adminPassword,
      contributor: runtime?.env?.SEED_CONTRIBUTOR_PASSWORD || adminPassword,
      viewer: runtime?.env?.SEED_VIEWER_PASSWORD || adminPassword,
    };

    const results: { user: string; status: string }[] = [];

    for (const userData of SEED_USERS) {
      // Check if user already exists
      const existing = await getUserByEmail(USERS, userData.email);
      if (existing) {
        results.push({ user: userData.id, status: 'already exists' });
        continue;
      }

      // Hash password
      const password = passwords[userData.role] || passwords.admin;
      const passwordHash = await hashPasswordV2(password);

      // Create user object
      const user = {
        ...userData,
        passwordHash,
        createdAt: new Date().toISOString(),
        emailConfirmed: true, // Seed users are pre-confirmed
      };

      // Store user
      await USERS.put(`user:${user.id}`, JSON.stringify(user));

      // Store email index
      await USERS.put(`email:${user.email}`, user.id);

      results.push({ user: userData.id, status: 'created' });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Users initialized',
        results,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Init error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to initialize users' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
