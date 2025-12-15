/**
 * @fileoverview Admin User Creation API Endpoint
 *
 * Creates new user accounts with admin privileges. Admin-created users
 * bypass email confirmation and are immediately active.
 *
 * @module pages/api/admin/users/create
 * @see {@link module:lib/auth/kv-auth} - User storage and hashing
 * @see {@link module:pages/api/admin/users/list} - List users
 * @see {@link module:pages/api/admin/users/[id]} - Update/delete users
 *
 * ## Endpoint
 *
 * `POST /api/admin/users/create`
 *
 * ## Authentication
 *
 * Requires valid session cookie with `role: 'admin'`.
 *
 * ## Request Body
 *
 * ```json
 * {
 *   "username": "johndoe",
 *   "email": "john@example.com",
 *   "password": "SecureP@ss123",
 *   "name": "John Doe",
 *   "role": "editor"
 * }
 * ```
 *
 * | Field | Required | Validation |
 * |-------|----------|------------|
 * | username | Yes | 3-20 chars, alphanumeric + underscore |
 * | email | Yes | Valid email format |
 * | password | Yes | Any (admin sets password) |
 * | name | Yes | Display name |
 * | role | No | admin/editor/contributor/viewer (default: viewer) |
 *
 * ## Response
 *
 * **Success (201):**
 * ```json
 * {
 *   "success": true,
 *   "user": { "id": "johndoe", "email": "...", "role": "editor", ... }
 * }
 * ```
 *
 * **Error Responses:**
 *
 * | Status | Error | Cause |
 * |--------|-------|-------|
 * | 400 | Missing required fields | Validation failed |
 * | 403 | Unauthorized | Not admin |
 * | 409 | Email/Username exists | Duplicate user |
 * | 503 | Service unavailable | KV not available |
 *
 * ## Role Access Levels
 *
 * | Role | Access Level |
 * |------|-------------|
 * | admin | 10 |
 * | editor | 5 |
 * | contributor | 3 |
 * | viewer | 1 |
 *
 * ## Security Notes
 *
 * - Admin-created users have `emailConfirmed: true`
 * - Password is hashed with PBKDF2 before storage
 * - User count incremented in `count:users` key
 * - Action is logged with admin ID
 *
 * @author How To Win Capitalism Team
 * @since 1.0.0
 */
import type { APIRoute } from 'astro';
import {
  getCurrentUser,
  hashPassword,
  getUserByEmail,
  getUserById,
  sanitizeUser,
  type KVUser,
} from '../../../../lib/auth/kv-auth';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Check if KV is available
    const USERS = (locals as Record<string, unknown>).runtime?.env?.USERS as KVNamespace | undefined;
    const SESSIONS = (locals as Record<string, unknown>).runtime?.env?.SESSIONS as KVNamespace | undefined;

    if (!USERS || !SESSIONS) {
      return new Response(
        JSON.stringify({ error: 'Service unavailable' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify admin session
    const cookieHeader = request.headers.get('cookie');
    const currentUser = await getCurrentUser(USERS, SESSIONS, cookieHeader);

    if (!currentUser || currentUser.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Unauthorized. Admin access required.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body = await request.json();
    const { username, email, password, name, role } = body;

    // Validate required fields
    if (!username || !email || !password || !name) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields (username, email, password, name)' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate username format
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return new Response(
        JSON.stringify({ error: 'Invalid username. Use 3-20 alphanumeric characters or underscores.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate role
    const validRoles = ['admin', 'editor', 'contributor', 'viewer'];
    const userRole = role || 'viewer';
    if (!validRoles.includes(userRole)) {
      return new Response(
        JSON.stringify({ error: 'Invalid role. Must be one of: admin, editor, contributor, viewer' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if email already exists
    const existingEmail = await getUserByEmail(USERS, email);
    if (existingEmail) {
      return new Response(
        JSON.stringify({ error: 'Email already registered' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if username already exists
    const existingUsername = await getUserById(USERS, username);
    if (existingUsername) {
      return new Response(
        JSON.stringify({ error: 'Username already taken' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Access level based on role
    const accessLevels: Record<string, number> = {
      admin: 10,
      editor: 5,
      contributor: 3,
      viewer: 1,
    };

    // Create user (pre-confirmed since admin-created)
    const now = new Date();
    const user: KVUser = {
      id: username,
      email: email.toLowerCase(),
      passwordHash,
      name,
      role: userRole as 'admin' | 'editor' | 'contributor' | 'viewer',
      accessLevel: accessLevels[userRole],
      avatar: '/favicon.svg',
      bio: '',
      createdAt: now.toISOString(),
      emailConfirmed: true, // Admin-created users are pre-confirmed
    };

    // Store user
    await USERS.put(`user:${user.id}`, JSON.stringify(user));

    // Store email index
    await USERS.put(`email:${user.email}`, user.id);

    // Increment user count
    const countData = await USERS.get('count:users');
    const currentCount = countData ? parseInt(countData, 10) : 0;
    await USERS.put('count:users', String(currentCount + 1));

    console.log(`Admin ${currentUser.id} created user ${user.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        user: sanitizeUser(user),
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Admin create user error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
