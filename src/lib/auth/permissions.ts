/**
 * @fileoverview Role-Based Access Control (RBAC) Permissions Module
 *
 * Centralized permission checking for the application. Implements a
 * hierarchical access level system where higher levels inherit all
 * permissions of lower levels.
 *
 * @module lib/auth/permissions
 * @see {@link module:lib/auth/store} - Gets current user for permission checks
 * @see {@link module:components/guards/OwnerGuard} - UI permission guards
 *
 * ## Access Levels
 *
 * | Role        | Level | Description                            |
 * |-------------|-------|----------------------------------------|
 * | admin       | 10    | Full system access, user management    |
 * | editor      | 5     | Full content access (no delete/users)  |
 * | contributor | 3     | Own content only                       |
 * | viewer      | 1     | Read public content only               |
 *
 * ## Permission Matrix
 *
 * ```
 * ┌──────────────────┬───────┬────────┬─────────────┬────────┐
 * │ Operation        │ Admin │ Editor │ Contributor │ Viewer │
 * ├──────────────────┼───────┼────────┼─────────────┼────────┤
 * │ Create content   │  ✅   │   ✅   │   ✅ (own)  │   ❌   │
 * │ Read public      │  ✅   │   ✅   │      ✅     │   ✅   │
 * │ Read private     │  ✅   │   ✅   │   ✅ (own)  │   ❌   │
 * │ Update any       │  ✅   │   ✅   │      ❌     │   ❌   │
 * │ Update own       │  ✅   │   ✅   │      ✅     │   ❌   │
 * │ Delete any       │  ✅   │   ❌   │      ❌     │   ❌   │
 * │ Delete own       │  ✅   │   ❌   │      ❌     │   ❌   │
 * │ Manage users     │  ✅   │   ❌   │      ❌     │   ❌   │
 * │ System settings  │  ✅   │   ❌   │      ❌     │   ❌   │
 * └──────────────────┴───────┴────────┴─────────────┴────────┘
 * ```
 *
 * ## Usage
 *
 * ```typescript
 * // Check specific operation
 * const { granted, reason } = checkPermission('update', resourceOwnerId);
 *
 * // Convenience methods
 * if (can.delete(ownerId).granted) { ... }
 * if (isAdmin()) { ... }
 * if (isOwner(resourceId)) { ... }
 * ```
 *
 * @author How To Win Capitalism Team
 * @since 1.0.0
 */

import { getCurrentUser } from './store';
import { authDebug, debug } from '../debug';

// Access level thresholds
export const ACCESS_LEVELS = {
  ADMIN: 10,
  EDITOR: 5,
  CONTRIBUTOR: 3,
  VIEWER: 1,
  NONE: 0,
} as const;

// Operation types
export type Operation = 'create' | 'read' | 'update' | 'delete' | 'manage_users' | 'system_settings';

// Permission check result
export interface PermissionResult {
  granted: boolean;
  reason: string;
}

/**
 * Check if user can perform an operation on a resource
 */
export function checkPermission(
  operation: Operation,
  resourceOwnerId?: string,
  resourceVisibility: 'public' | 'private' | 'team' = 'public'
): PermissionResult {
  const user = getCurrentUser();

  // Not logged in
  if (!user) {
    const canRead = operation === 'read' && resourceVisibility === 'public';
    const result = {
      granted: canRead,
      reason: canRead ? 'Public content readable by all' : 'Authentication required',
    };
    authDebug.permissionCheck(operation, resourceOwnerId || 'unknown', result.granted, { visibility: resourceVisibility });
    return result;
  }

  const { id: userId, role, accessLevel } = user;
  const isOwner = resourceOwnerId === userId;

  let granted = false;
  let reason = '';

  switch (operation) {
    case 'create':
      // Admin, Editor can create anything
      // Contributor can create (will own it)
      granted = accessLevel >= ACCESS_LEVELS.CONTRIBUTOR;
      reason = granted ? `${role} can create content` : 'Viewers cannot create content';
      break;

    case 'read':
      // Admin, Editor can read everything
      if (accessLevel >= ACCESS_LEVELS.EDITOR) {
        granted = true;
        reason = `${role} can read all content`;
      }
      // Contributor can read public + own private
      else if (accessLevel >= ACCESS_LEVELS.CONTRIBUTOR) {
        granted = resourceVisibility === 'public' || isOwner;
        reason = granted
          ? (isOwner ? 'Owner can read own content' : 'Public content readable')
          : 'Cannot read others\' private content';
      }
      // Viewer can only read public
      else {
        granted = resourceVisibility === 'public';
        reason = granted ? 'Public content readable' : 'Private content requires higher access';
      }
      break;

    case 'update':
      // Admin can update anything
      if (accessLevel >= ACCESS_LEVELS.ADMIN) {
        granted = true;
        reason = 'Admin can update any content';
      }
      // Editor can update anything
      else if (accessLevel >= ACCESS_LEVELS.EDITOR) {
        granted = true;
        reason = 'Editor can update any content';
      }
      // Contributor can only update own
      else if (accessLevel >= ACCESS_LEVELS.CONTRIBUTOR) {
        granted = isOwner;
        reason = isOwner ? 'Owner can update own content' : 'Cannot update others\' content';
      }
      // Viewer cannot update
      else {
        granted = false;
        reason = 'Viewer cannot update content';
      }
      break;

    case 'delete':
      // Only Admin can delete
      granted = accessLevel >= ACCESS_LEVELS.ADMIN;
      reason = granted ? 'Admin can delete content' : 'Only admin can delete content';
      break;

    case 'manage_users':
      granted = accessLevel >= ACCESS_LEVELS.ADMIN;
      reason = granted ? 'Admin can manage users' : 'Only admin can manage users';
      break;

    case 'system_settings':
      granted = accessLevel >= ACCESS_LEVELS.ADMIN;
      reason = granted ? 'Admin can modify system settings' : 'Only admin can modify system settings';
      break;

    default:
      granted = false;
      reason = 'Unknown operation';
  }

  // Log the permission check
  authDebug.permissionCheck(operation, resourceOwnerId || 'system', granted, {
    userId,
    role,
    accessLevel,
    isOwner,
    visibility: resourceVisibility,
  });

  return { granted, reason };
}

/**
 * Convenience methods for common permission checks
 */
export const can = {
  create: () => checkPermission('create'),
  read: (ownerId?: string, visibility?: 'public' | 'private' | 'team') =>
    checkPermission('read', ownerId, visibility),
  update: (ownerId?: string) => checkPermission('update', ownerId),
  delete: (ownerId?: string) => checkPermission('delete', ownerId),
  manageUsers: () => checkPermission('manage_users'),
  systemSettings: () => checkPermission('system_settings'),
};

/**
 * Check if current user is the owner of a resource
 */
export function isOwner(resourceOwnerId: string): boolean {
  const user = getCurrentUser();
  return user?.id === resourceOwnerId;
}

/**
 * Check if current user has admin role
 */
export function isAdmin(): boolean {
  const user = getCurrentUser();
  return (user?.accessLevel ?? 0) >= ACCESS_LEVELS.ADMIN;
}

/**
 * Check if current user has at least editor role
 */
export function isEditor(): boolean {
  const user = getCurrentUser();
  return (user?.accessLevel ?? 0) >= ACCESS_LEVELS.EDITOR;
}

/**
 * Check if current user has at least contributor role
 */
export function isContributor(): boolean {
  const user = getCurrentUser();
  return (user?.accessLevel ?? 0) >= ACCESS_LEVELS.CONTRIBUTOR;
}

/**
 * Get the minimum access level required for an operation
 */
export function getRequiredLevel(operation: Operation, isOwnContent: boolean = false): number {
  switch (operation) {
    case 'create':
      return ACCESS_LEVELS.CONTRIBUTOR;
    case 'read':
      return ACCESS_LEVELS.VIEWER; // But private content needs owner check
    case 'update':
      return isOwnContent ? ACCESS_LEVELS.CONTRIBUTOR : ACCESS_LEVELS.EDITOR;
    case 'delete':
      return ACCESS_LEVELS.ADMIN;
    case 'manage_users':
    case 'system_settings':
      return ACCESS_LEVELS.ADMIN;
    default:
      return ACCESS_LEVELS.ADMIN; // Default to highest restriction
  }
}
