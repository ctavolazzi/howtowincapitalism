/**
 * /api/admin/users/[id]
 *
 * Admin endpoints for managing individual users.
 * - GET: Get user details
 * - PUT: Update user
 * - DELETE: Delete user
 */
import type { APIRoute } from 'astro';
import {
  getCurrentUser,
  getUserById,
  hashPassword,
  sanitizeUser,
  type KVUser,
} from '../../../../lib/auth/kv-auth';

/**
 * GET /api/admin/users/[id]
 * Get user details by ID
 */
export const GET: APIRoute = async ({ params, request, locals }) => {
  try {
    const { id } = params;

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'User ID required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

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

    // Get user
    const user = await getUserById(USERS, id);
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: sanitizeUser(user),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Admin get user error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * PUT /api/admin/users/[id]
 * Update user details
 */
export const PUT: APIRoute = async ({ params, request, locals }) => {
  try {
    const { id } = params;

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'User ID required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

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

    // Get existing user
    const user = await getUserById(USERS, id);
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse update body
    const body = await request.json();
    const { name, role, bio, emailConfirmed, password } = body;

    // Validate role if provided
    const validRoles = ['admin', 'editor', 'contributor', 'viewer'];
    if (role && !validRoles.includes(role)) {
      return new Response(
        JSON.stringify({ error: 'Invalid role' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Prevent admin from demoting themselves
    if (currentUser.id === id && role && role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Cannot demote yourself from admin' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update fields
    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (emailConfirmed !== undefined) user.emailConfirmed = emailConfirmed;

    if (role !== undefined) {
      user.role = role;
      // Update access level based on role
      const accessLevels: Record<string, number> = {
        admin: 10,
        editor: 5,
        contributor: 3,
        viewer: 1,
      };
      user.accessLevel = accessLevels[role];
    }

    // Update password if provided
    if (password) {
      user.passwordHash = await hashPassword(password);
    }

    // Save updated user
    await USERS.put(`user:${user.id}`, JSON.stringify(user));

    console.log(`Admin ${currentUser.id} updated user ${user.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        user: sanitizeUser(user),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Admin update user error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * DELETE /api/admin/users/[id]
 * Delete a user
 */
export const DELETE: APIRoute = async ({ params, request, locals }) => {
  try {
    const { id } = params;

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'User ID required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

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

    // Prevent self-deletion
    if (currentUser.id === id) {
      return new Response(
        JSON.stringify({ error: 'Cannot delete yourself' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get existing user
    const user = await getUserById(USERS, id);
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Delete user
    await USERS.delete(`user:${id}`);

    // Delete email index
    await USERS.delete(`email:${user.email}`);

    // Decrement user count
    const countData = await USERS.get('count:users');
    const currentCount = countData ? parseInt(countData, 10) : 1;
    await USERS.put('count:users', String(Math.max(0, currentCount - 1)));

    console.log(`Admin ${currentUser.id} deleted user ${id}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `User ${id} deleted`,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Admin delete user error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
