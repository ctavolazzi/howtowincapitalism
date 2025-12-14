# Authentication System

> Complete documentation for the authentication and authorization system
>
> Last Updated: 2025-12-14

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Authentication Flow](#authentication-flow)
4. [Password Security](#password-security)
5. [Session Management](#session-management)
6. [Email Confirmation](#email-confirmation)
7. [Password Reset](#password-reset)
8. [Role-Based Access Control](#role-based-access-control)
9. [Rate Limiting](#rate-limiting)
10. [CSRF Protection](#csrf-protection)
11. [Client-Side Integration](#client-side-integration)
12. [Development Mode](#development-mode)
13. [File Reference](#file-reference)

---

## Overview

The authentication system uses **Cloudflare KV** for storage and **httpOnly cookies** for session management. This is a proper server-side auth system (not localStorage-based).

### Key Features

| Feature | Implementation |
|---------|----------------|
| Password Hashing | PBKDF2 (100,000 iterations) |
| Session Storage | Cloudflare KV with TTL |
| Cookie Security | httpOnly, Secure, SameSite=Strict |
| CSRF Protection | AES-GCM encrypted tokens |
| Rate Limiting | IP + email-based |
| Account Lockout | After 20 failed attempts |
| Email Confirmation | Required for new accounts |
| Password Reset | Secure token-based |

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AUTH SYSTEM ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        CLOUDFLARE KV                                 │    │
│  ├─────────────────────┬─────────────────────┬─────────────────────────┤    │
│  │   USERS Namespace   │  SESSIONS Namespace │   Rate Limit Data       │    │
│  │   ─────────────────│   ─────────────────  │   ─────────────────     │    │
│  │   user:{id}        │   session:{token}    │   rate:login:ip:{ip}    │    │
│  │   email:{email}    │                      │   rate:login:email:{x}  │    │
│  │   confirm:{token}  │                      │   lockout:{email}       │    │
│  │   reset:{token}    │                      │   failed:{email}        │    │
│  └─────────────────────┴─────────────────────┴─────────────────────────┘    │
│                                     │                                        │
│                                     ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     API ROUTES (Cloudflare Workers)                  │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │  POST /api/auth/login      │  POST /api/auth/logout                 │    │
│  │  POST /api/auth/register   │  GET  /api/auth/me                     │    │
│  │  POST /api/auth/confirm    │  POST /api/auth/forgot-password        │    │
│  │  POST /api/auth/reset-password                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                     │                                        │
│                                     ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                           CLIENT                                     │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │   httpOnly cookie (XSS-resistant, auto-sent with requests)          │    │
│  │   nanostores (authStore, userStore) for UI state                    │    │
│  │   No secrets stored in JavaScript or localStorage                   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Module Structure

```
src/lib/auth/
├── kv-auth.ts          # KV storage operations (611 lines)
│   ├── hashPassword()
│   ├── verifyPassword()
│   ├── createSession()
│   ├── getSession()
│   ├── createUser()
│   ├── confirmEmail()
│   └── resetPassword()
├── permissions.ts      # RBAC system (225 lines)
│   ├── checkPermission()
│   ├── can.read/update/delete()
│   └── isAdmin/isEditor/isContributor()
├── rate-limit.ts       # Rate limiting (273 lines)
│   ├── checkRateLimit()
│   ├── recordRateLimitedAction()
│   └── checkAccountLockout()
├── csrf.ts             # CSRF protection (176 lines)
│   ├── generateCSRFToken()
│   └── validateCSRFToken()
├── store.ts            # Client-side auth state
├── userStore.ts        # User data store
├── api-client.ts       # Client-side API wrapper
├── local-auth.ts       # Development fallback
└── index.ts            # Module exports
```

---

## Authentication Flow

### Login Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  User    │     │  Login   │     │  API     │     │  Auth    │     │   KV     │
│          │     │  Form    │     │  Route   │     │  Module  │     │          │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │                │
     │ Submit form    │                │                │                │
     │───────────────▶│                │                │                │
     │                │                │                │                │
     │                │ POST /api/auth/login            │                │
     │                │ {email, password, csrf_token}   │                │
     │                │───────────────▶│                │                │
     │                │                │                │                │
     │                │                │ 1. Validate CSRF               │
     │                │                │───────────────▶│                │
     │                │                │◀───────────────│                │
     │                │                │                │                │
     │                │                │ 2. Check rate limit            │
     │                │                │───────────────▶│───────────────▶│
     │                │                │◀───────────────│◀───────────────│
     │                │                │                │                │
     │                │                │ 3. Check lockout               │
     │                │                │───────────────▶│───────────────▶│
     │                │                │◀───────────────│◀───────────────│
     │                │                │                │                │
     │                │                │ 4. Validate credentials        │
     │                │                │───────────────▶│───────────────▶│
     │                │                │◀───────────────│◀───────────────│
     │                │                │                │                │
     │                │                │ 5. Create session              │
     │                │                │───────────────▶│───────────────▶│
     │                │                │◀───────────────│◀───────────────│
     │                │                │                │                │
     │                │ Response + Set-Cookie           │                │
     │                │◀───────────────│                │                │
     │                │                │                │                │
     │ Redirect home  │                │                │                │
     │◀───────────────│                │                │                │
```

### Login Code Path

```typescript
// src/pages/api/auth/login.ts

export const POST: APIRoute = async ({ request, locals }) => {
  // 1. Parse request body
  const { email, password, csrf_token } = await request.json();

  // 2. Validate input
  if (!email || !password) {
    return new Response(JSON.stringify({ error: 'Email and password required' }), { status: 400 });
  }

  // 3. Validate CSRF token
  const csrfResult = await validateCSRFToken(csrf_token, CSRF_SECRET, ip, country, userAgent);
  if (!csrfResult.valid) {
    return new Response(JSON.stringify({ error: 'Invalid security token' }), { status: 403 });
  }

  // 4. Check rate limit
  const rateLimit = await checkRateLimit(USERS, 'login', { ip, email });
  if (!rateLimit.allowed) {
    return new Response(JSON.stringify({ error: rateLimit.reason }), {
      status: 429,
      headers: getRateLimitHeaders(rateLimit.retryAfter)
    });
  }

  // 5. Check account lockout
  const lockout = await checkAccountLockout(USERS, email);
  if (lockout.locked) {
    return new Response(JSON.stringify({ error: lockout.reason }), { status: 423 });
  }

  // 6. Validate credentials
  const { user, needsConfirmation } = await validateCredentialsWithConfirmation(USERS, email, password);

  if (needsConfirmation) {
    return new Response(JSON.stringify({ error: 'Email not confirmed', needsConfirmation: true }), { status: 403 });
  }

  if (!user) {
    await recordRateLimitedAction(USERS, 'login', { ip, email }, false);
    return new Response(JSON.stringify({ error: 'Invalid email or password' }), { status: 401 });
  }

  // 7. Create session
  const { token, expiresAt } = await createSession(SESSIONS, user.id);

  // 8. Record successful login
  await recordRateLimitedAction(USERS, 'login', { ip, email }, true);

  // 9. Return response with cookie
  return new Response(JSON.stringify({ success: true, user: sanitizeUser(user) }), {
    status: 200,
    headers: { 'Set-Cookie': createSessionCookie(token, expiresAt) }
  });
};
```

---

## Password Security

### PBKDF2 Configuration

```typescript
// src/lib/auth/kv-auth.ts:35-38

const PBKDF2_ITERATIONS = 100000;   // 100k iterations
const PBKDF2_SALT_LENGTH = 16;      // 16 bytes = 128 bits
const PBKDF2_KEY_LENGTH = 32;       // 32 bytes = 256 bits
```

### Hash Format

```
v2:100000:e3b0c44298fc1c149afbf4c8996fb924:27ae41e4649b934ca495991b7852b855
│   │                │                              │
│   │                │                              └─ Derived key (hex)
│   │                └─ Salt (hex)
│   └─ Iteration count
└─ Version identifier
```

### Hashing Function

```typescript
// src/lib/auth/kv-auth.ts:76-107

export async function hashPasswordV2(password: string): Promise<string> {
  const encoder = new TextEncoder();

  // Generate random salt
  const salt = crypto.getRandomValues(new Uint8Array(PBKDF2_SALT_LENGTH));

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  // Derive key using PBKDF2
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    PBKDF2_KEY_LENGTH * 8
  );

  const hashHex = bufferToHex(derivedBits);
  const saltHex = bufferToHex(salt.buffer);

  return `v2:${PBKDF2_ITERATIONS}:${saltHex}:${hashHex}`;
}
```

### Constant-Time Comparison

```typescript
// src/lib/auth/kv-auth.ts:148-156

// Constant-time comparison (prevents timing attacks)
if (computedHashHex.length !== storedHashHex.length) {
  return false;
}
let result = 0;
for (let i = 0; i < computedHashHex.length; i++) {
  result |= computedHashHex.charCodeAt(i) ^ storedHashHex.charCodeAt(i);
}
return result === 0;
```

### V1 to V2 Migration

The system supports transparent migration from V1 (SHA-256 with static salt) to V2 (PBKDF2):

```typescript
// src/lib/auth/kv-auth.ts:191-206

export async function upgradePasswordHash(
  users: KVNamespace,
  userId: string,
  password: string
): Promise<void> {
  const user = await getUserById(users, userId);
  if (!user) return;

  // Hash with V2
  const newHash = await hashPasswordV2(password);
  user.passwordHash = newHash;

  // Save updated user
  await users.put(`user:${user.id}`, JSON.stringify(user));
  console.log(`Upgraded password hash for user ${userId} from V1 to V2 (PBKDF2)`);
}
```

---

## Session Management

### Session Configuration

```typescript
// src/lib/auth/kv-auth.ts:32-33

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const SESSION_COOKIE_NAME = 'htwc_session';
```

### Session Token Generation

```typescript
// src/lib/auth/kv-auth.ts:209-217

export function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
```

### Session Creation

```typescript
// src/lib/auth/kv-auth.ts:222-242

export async function createSession(
  sessions: KVNamespace,
  userId: string
): Promise<{ token: string; expiresAt: Date }> {
  const token = generateSessionToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_MS);

  const session: KVSession = {
    userId,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  // Store with TTL (in seconds)
  await sessions.put(`session:${token}`, JSON.stringify(session), {
    expirationTtl: Math.floor(SESSION_DURATION_MS / 1000),
  });

  return { token, expiresAt };
}
```

### Cookie Configuration

```typescript
// src/lib/auth/kv-auth.ts:310-312

export function createSessionCookie(token: string, expiresAt: Date): string {
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=${expiresAt.toUTCString()}`;
}
```

| Cookie Attribute | Value | Purpose |
|------------------|-------|---------|
| `HttpOnly` | Yes | Prevents JavaScript access (XSS protection) |
| `Secure` | Yes | HTTPS only |
| `SameSite` | Strict | Prevents CSRF |
| `Path` | / | Available site-wide |
| `Expires` | 24h | Auto-logout after 24 hours |

---

## Email Confirmation

### Registration with Confirmation

```typescript
// src/lib/auth/kv-auth.ts:374-427

export async function createUser(
  users: KVNamespace,
  data: { username: string; name: string; email: string; password: string }
): Promise<{ user: KVUser; confirmToken: string }> {
  // Check if email/username already exists
  const existing = await getUserByEmail(users, data.email);
  if (existing) {
    throw new Error('Email already registered');
  }

  const passwordHash = await hashPassword(data.password);
  const confirmToken = generateConfirmToken();
  const now = new Date();
  const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

  const user: KVUser = {
    id: data.username,
    email: data.email.toLowerCase(),
    passwordHash,
    name: data.name,
    role: 'viewer',
    accessLevel: 1,
    avatar: '/favicon.svg',
    bio: '',
    createdAt: now.toISOString(),
    emailConfirmed: false,
    confirmToken,
    confirmTokenExpires: expires.toISOString(),
  };

  // Store user, email index, and token index
  await users.put(`user:${user.id}`, JSON.stringify(user));
  await users.put(`email:${user.email}`, user.id);
  await users.put(`confirm:${confirmToken}`, user.id, {
    expirationTtl: 24 * 60 * 60,
  });

  return { user, confirmToken };
}
```

### Email Confirmation

```typescript
// src/lib/auth/kv-auth.ts:432-470

export async function confirmEmail(
  users: KVNamespace,
  token: string
): Promise<KVUser | null> {
  // Look up user by token
  const userId = await users.get(`confirm:${token}`);
  if (!userId) {
    return null; // Token invalid or expired
  }

  const user = await getUserById(users, userId);
  if (!user || user.confirmToken !== token) {
    return null;
  }

  // Check if token expired
  if (user.confirmTokenExpires && new Date(user.confirmTokenExpires) < new Date()) {
    return null;
  }

  // Update user as confirmed
  user.emailConfirmed = true;
  delete user.confirmToken;
  delete user.confirmTokenExpires;

  await users.put(`user:${user.id}`, JSON.stringify(user));
  await users.delete(`confirm:${token}`);

  return user;
}
```

---

## Password Reset

### Reset Flow

```
1. User requests reset    POST /api/auth/forgot-password
                          └─▶ Creates reset token (1 hour TTL)
                          └─▶ Sends email with reset link

2. User clicks link       GET /reset-password?token=xxx
                          └─▶ Validates token
                          └─▶ Shows reset form

3. User submits new pass  POST /api/auth/reset-password
                          └─▶ Validates token
                          └─▶ Hashes new password
                          └─▶ Updates user
                          └─▶ Deletes token (one-time use)
```

### Reset Token Creation

```typescript
// src/lib/auth/kv-auth.ts:518-545

export async function createPasswordReset(
  users: KVNamespace,
  email: string
): Promise<{ resetToken: string; user: KVUser } | null> {
  const user = await getUserByEmail(users, email);
  if (!user) {
    return null; // User not found (don't reveal this to client)
  }

  const resetToken = generateResetToken();
  const expires = new Date(Date.now() + RESET_TOKEN_DURATION_MS);

  await users.put(
    `reset:${resetToken}`,
    JSON.stringify({
      userId: user.id,
      email: user.email,
      createdAt: new Date().toISOString(),
      expiresAt: expires.toISOString(),
    }),
    {
      expirationTtl: Math.floor(RESET_TOKEN_DURATION_MS / 1000),
    }
  );

  return { resetToken, user };
}
```

---

## Role-Based Access Control

### Access Levels

```typescript
// src/lib/auth/permissions.ts:32-38

export const ACCESS_LEVELS = {
  ADMIN: 10,
  EDITOR: 5,
  CONTRIBUTOR: 3,
  VIEWER: 1,
  NONE: 0,
} as const;
```

### Permission Matrix

```
┌──────────────────┬───────┬────────┬─────────────┬────────┐
│ Operation        │ Admin │ Editor │ Contributor │ Viewer │
├──────────────────┼───────┼────────┼─────────────┼────────┤
│ Create content   │  ✅   │   ✅   │   ✅ (own)  │   ❌   │
│ Read public      │  ✅   │   ✅   │      ✅     │   ✅   │
│ Read private     │  ✅   │   ✅   │   ✅ (own)  │   ❌   │
│ Update any       │  ✅   │   ✅   │      ❌     │   ❌   │
│ Update own       │  ✅   │   ✅   │      ✅     │   ❌   │
│ Delete any       │  ✅   │   ❌   │      ❌     │   ❌   │
│ Delete own       │  ✅   │   ❌   │      ❌     │   ❌   │
│ Manage users     │  ✅   │   ❌   │      ❌     │   ❌   │
│ System settings  │  ✅   │   ❌   │      ❌     │   ❌   │
└──────────────────┴───────┴────────┴─────────────┴────────┘
```

### Permission Check Function

```typescript
// src/lib/auth/permissions.ts:52-158

export function checkPermission(
  operation: Operation,
  resourceOwnerId?: string,
  resourceVisibility: 'public' | 'private' | 'team' = 'public'
): PermissionResult {
  const user = getCurrentUser();

  if (!user) {
    const canRead = operation === 'read' && resourceVisibility === 'public';
    return {
      granted: canRead,
      reason: canRead ? 'Public content readable by all' : 'Authentication required',
    };
  }

  const { id: userId, role, accessLevel } = user;
  const isOwner = resourceOwnerId === userId;

  // Permission logic per operation...
}
```

### Convenience Methods

```typescript
// src/lib/auth/permissions.ts:163-171

export const can = {
  create: () => checkPermission('create'),
  read: (ownerId?: string, visibility?: 'public' | 'private' | 'team') =>
    checkPermission('read', ownerId, visibility),
  update: (ownerId?: string) => checkPermission('update', ownerId),
  delete: (ownerId?: string) => checkPermission('delete', ownerId),
  manageUsers: () => checkPermission('manage_users'),
  systemSettings: () => checkPermission('system_settings'),
};
```

---

## Rate Limiting

### Configuration

```typescript
// src/lib/auth/rate-limit.ts:8-18

const RATE_LIMITS = {
  login: {
    ip: { max: 5, windowMs: 15 * 60 * 1000 },      // 5 per IP per 15 minutes
    email: { max: 10, windowMs: 60 * 60 * 1000 }, // 10 per email per hour
  },
  register: {
    ip: { max: 3, windowMs: 60 * 60 * 1000 },           // 3 per IP per hour
    global: { max: 100, windowMs: 24 * 60 * 60 * 1000 }, // 100 per day globally
  },
};

const LOCKOUT_CONFIG = {
  maxAttempts: 20,                    // Lock after 20 failed attempts
  lockoutDuration: 60 * 60 * 1000,    // 1 hour lockout
};
```

### Rate Limit Check

```typescript
// src/lib/auth/rate-limit.ts:40-106

export async function checkRateLimit(
  kv: KVNamespace,
  action: 'login' | 'register',
  identifier: { ip: string; email?: string }
): Promise<{ allowed: boolean; retryAfter?: number; reason?: string }> {
  const limits = RATE_LIMITS[action];
  const now = Date.now();

  // Check IP rate limit
  const ipKey = `rate:${action}:ip:${identifier.ip}`;
  const ipEntry = await getOrCreateRateEntry(kv, ipKey);

  if (isWindowExpired(ipEntry, limits.ip.windowMs)) {
    ipEntry.count = 0;
    ipEntry.windowStart = now;
  }

  if (ipEntry.count >= limits.ip.max) {
    const retryAfter = Math.ceil((ipEntry.windowStart + limits.ip.windowMs - now) / 1000);
    return {
      allowed: false,
      retryAfter,
      reason: `Too many ${action} attempts from this IP. Try again in ${Math.ceil(retryAfter / 60)} minutes.`,
    };
  }

  // Additional checks for email and global limits...

  return { allowed: true };
}
```

### Account Lockout

```typescript
// src/lib/auth/rate-limit.ts:148-174

export async function checkAccountLockout(
  kv: KVNamespace,
  email: string
): Promise<{ locked: boolean; until?: number; reason?: string }> {
  const lockoutKey = `lockout:${email.toLowerCase()}`;
  const lockoutData = await kv.get(lockoutKey);

  if (!lockoutData) {
    return { locked: false };
  }

  const lockout: LockoutEntry = JSON.parse(lockoutData);
  const now = Date.now();

  if (now >= lockout.until) {
    await kv.delete(lockoutKey);
    return { locked: false };
  }

  const remainingMs = lockout.until - now;
  return {
    locked: true,
    until: lockout.until,
    reason: `Account locked due to too many failed attempts. Try again in ${Math.ceil(remainingMs / 60000)} minutes.`,
  };
}
```

---

## CSRF Protection

### Token Generation

```typescript
// src/lib/auth/csrf.ts:72-100

export async function generateCSRFToken(
  secret: string,
  ip: string,
  country: string,
  userAgent: string
): Promise<string> {
  const payload: CSRFTokenPayload = {
    ip,
    country,
    ua: userAgent.slice(0, 200),
    exp: Date.now() + TOKEN_EXPIRY_MS, // 60 seconds
  };

  const encoder = new TextEncoder();
  const key = await deriveKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(JSON.stringify(payload))
  );

  return `${bufferToHex(iv.buffer)}:${bufferToHex(encrypted)}`;
}
```

### Token Validation

```typescript
// src/lib/auth/csrf.ts:105-158

export async function validateCSRFToken(
  token: string,
  secret: string,
  ip: string,
  country: string,
  userAgent: string
): Promise<{ valid: boolean; error?: string }> {
  // Decrypt and validate:
  // 1. Token format
  // 2. Expiry (60 seconds)
  // 3. IP match
  // 4. Country match
  // 5. User agent match
}
```

---

## Client-Side Integration

### API Client

```typescript
// src/lib/auth/api-client.ts

export async function checkAuth(): Promise<{ authenticated: boolean; user: User | null }> {
  const response = await fetch('/api/auth/me');
  return response.json();
}

export async function login(email: string, password: string, csrfToken: string) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, csrf_token: csrfToken }),
  });
  return response.json();
}

export async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
}
```

### Auth Store

```typescript
// src/lib/auth/store.ts

import { atom } from 'nanostores';

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}

export const authStore = atom<AuthState>({
  isAuthenticated: false,
  user: null,
  isLoading: true,
});

export function getCurrentUser(): User | null {
  return authStore.get().user;
}
```

---

## Development Mode

### Local Auth Fallback

When KV is not available (local development), the system falls back to mock authentication:

```typescript
// src/lib/auth/local-auth.ts

const MOCK_USERS = [
  { id: 'admin', email: 'admin@email.com', password: 'Adm!n_Secure_2024#', role: 'admin' },
  { id: 'editor', email: 'editor@email.com', password: 'Ed!tor_Access_2024#', role: 'editor' },
  // ...
];

export function validateCredentialsLocal(email: string, password: string): User | null {
  const user = MOCK_USERS.find(u => u.email === email && u.password === password);
  return user || null;
}
```

### Detection Logic

```typescript
// src/pages/api/auth/login.ts

const hasKV = locals.runtime?.env?.USERS !== undefined;

if (hasKV) {
  // Production: Use Cloudflare KV
  result = await validateCredentialsWithConfirmation(USERS, email, password);
} else {
  // Development: Use local mock
  user = validateCredentialsLocal(email, password);
}
```

---

## File Reference

### Server-Side Files

| File | Purpose | Lines |
|------|---------|-------|
| `src/lib/auth/kv-auth.ts` | KV auth utilities | 611 |
| `src/lib/auth/permissions.ts` | RBAC system | 225 |
| `src/lib/auth/rate-limit.ts` | Rate limiting | 273 |
| `src/lib/auth/csrf.ts` | CSRF protection | 176 |
| `src/pages/api/auth/login.ts` | Login endpoint | 188 |
| `src/pages/api/auth/register.ts` | Registration endpoint | 311 |
| `src/pages/api/auth/logout.ts` | Logout endpoint | ~30 |
| `src/pages/api/auth/me.ts` | Current user endpoint | ~50 |
| `src/pages/api/auth/confirm.ts` | Email confirmation | ~60 |
| `src/pages/api/auth/forgot-password.ts` | Password reset request | ~80 |
| `src/pages/api/auth/reset-password.ts` | Password reset completion | ~70 |

### Client-Side Files

| File | Purpose |
|------|---------|
| `src/lib/auth/store.ts` | Auth state store |
| `src/lib/auth/userStore.ts` | User data store |
| `src/lib/auth/api-client.ts` | API wrapper |
| `src/components/auth/LoginForm.astro` | Login form |
| `src/components/auth/UserMenu.astro` | User menu |

### Configuration Files

| File | Purpose |
|------|---------|
| `wrangler.toml` | KV namespace bindings |
| `src/env.d.ts` | TypeScript types |

---

## Related Documentation

- [API Reference](./API_REFERENCE.md) - All API endpoints
- [Security](./SECURITY.md) - Security measures
- [Data Models](./DATA_MODELS.md) - KV storage schema
