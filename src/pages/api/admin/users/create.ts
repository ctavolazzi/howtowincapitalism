/**
 * POST /api/admin/users/create
 *
 * Admin endpoint to create a new user account.
 * Bypasses email confirmation (admin-created users are pre-confirmed).
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
