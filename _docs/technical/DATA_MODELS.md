# Data Models & Storage

> Complete documentation for data structures and Cloudflare KV storage
>
> Last Updated: 2025-12-14

---

## Table of Contents

1. [Overview](#overview)
2. [Cloudflare KV Namespaces](#cloudflare-kv-namespaces)
3. [User Data Model](#user-data-model)
4. [Session Data Model](#session-data-model)
5. [Rate Limiting Data](#rate-limiting-data)
6. [Token Data Models](#token-data-models)
7. [KV Key Patterns](#kv-key-patterns)
8. [TTL Configuration](#ttl-configuration)
9. [TypeScript Interfaces](#typescript-interfaces)
10. [Data Operations](#data-operations)

---

## Overview

The application uses **Cloudflare KV** as its primary data store. KV is a globally distributed key-value store optimized for read-heavy workloads.

### Storage Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CLOUDFLARE KV STORAGE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                       USERS NAMESPACE                                │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │                                                                      │    │
│  │  PRIMARY DATA                                                        │    │
│  │  ├── user:{id}           → KVUser (JSON)                            │    │
│  │  │                                                                   │    │
│  │  INDEXES                                                             │    │
│  │  ├── email:{email}       → userId (string)                          │    │
│  │  │                                                                   │    │
│  │  TOKENS                                                              │    │
│  │  ├── confirm:{token}     → userId (string, TTL: 24h)                │    │
│  │  ├── reset:{token}       → ResetTokenData (JSON, TTL: 1h)           │    │
│  │  │                                                                   │    │
│  │  RATE LIMITING                                                       │    │
│  │  ├── rate:login:ip:{ip}      → RateEntry (JSON, TTL: ~23min)        │    │
│  │  ├── rate:login:email:{x}    → RateEntry (JSON, TTL: ~1.5h)         │    │
│  │  ├── rate:register:ip:{ip}   → RateEntry (JSON, TTL: ~1.5h)         │    │
│  │  ├── rate:register:daily     → RateEntry (JSON, TTL: ~36h)          │    │
│  │  │                                                                   │    │
│  │  SECURITY                                                            │    │
│  │  ├── failed:{email}      → FailedAttempts (JSON, TTL: 1h)           │    │
│  │  └── lockout:{email}     → LockoutEntry (JSON, TTL: 1h)             │    │
│  │                                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      SESSIONS NAMESPACE                              │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │                                                                      │    │
│  │  └── session:{token}     → KVSession (JSON, TTL: 24h)               │    │
│  │                                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Cloudflare KV Namespaces

### Configuration

```toml
# wrangler.toml

[[kv_namespaces]]
binding = "USERS"
id = "xxxx-users-namespace-id"
preview_id = "xxxx-preview-users-namespace-id"

[[kv_namespaces]]
binding = "SESSIONS"
id = "xxxx-sessions-namespace-id"
preview_id = "xxxx-preview-sessions-namespace-id"
```

### Namespace Purposes

| Namespace | Purpose | Primary Keys |
|-----------|---------|--------------|
| `USERS` | User data, indexes, rate limits | `user:*`, `email:*`, `rate:*` |
| `SESSIONS` | Session data | `session:*` |

---

## User Data Model

### KVUser Interface

```typescript
// src/lib/auth/kv-auth.ts:9-23

export interface KVUser {
  // Identity
  id: string;                    // Username (primary key)
  email: string;                 // Lowercase email
  passwordHash: string;          // PBKDF2 hash (v2:iterations:salt:hash)

  // Profile
  name: string;                  // Display name
  avatar: string;                // Avatar URL
  bio: string;                   // Bio text

  // Authorization
  role: 'admin' | 'editor' | 'contributor' | 'viewer';
  accessLevel: number;           // 10, 5, 3, or 1

  // Metadata
  createdAt: string;             // ISO 8601 timestamp

  // Email confirmation
  emailConfirmed: boolean;
  confirmToken?: string;         // Confirmation token (temp)
  confirmTokenExpires?: string;  // ISO 8601 timestamp (temp)
}
```

### Example User Document

```json
{
  "id": "johndoe",
  "email": "john@example.com",
  "passwordHash": "v2:100000:a1b2c3d4e5f6...:9876543210abcdef...",
  "name": "John Doe",
  "avatar": "/favicon.svg",
  "bio": "Just a user",
  "role": "viewer",
  "accessLevel": 1,
  "createdAt": "2025-12-14T10:00:00.000Z",
  "emailConfirmed": true
}
```

### User Roles

| Role | Access Level | Capabilities |
|------|--------------|--------------|
| `admin` | 10 | Full CRUD, user management, system settings |
| `editor` | 5 | Create, read, update all content |
| `contributor` | 3 | CRUD on own content only |
| `viewer` | 1 | Read public content only |

---

## Session Data Model

### KVSession Interface

```typescript
// src/lib/auth/kv-auth.ts:25-29

export interface KVSession {
  userId: string;       // Reference to user ID
  createdAt: string;    // ISO 8601 timestamp
  expiresAt: string;    // ISO 8601 timestamp
}
```

### Example Session Document

```json
{
  "userId": "johndoe",
  "createdAt": "2025-12-14T10:00:00.000Z",
  "expiresAt": "2025-12-15T10:00:00.000Z"
}
```

### Session Token Format

64-character hexadecimal string generated from 32 cryptographically random bytes:

```
a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef12345678
```

---

## Rate Limiting Data

### RateEntry Interface

```typescript
// src/lib/auth/rate-limit.ts:26-29

interface RateEntry {
  count: number;       // Number of attempts in window
  windowStart: number; // Window start timestamp (ms)
}
```

### Example Rate Entry

```json
{
  "count": 3,
  "windowStart": 1702500000000
}
```

### LockoutEntry Interface

```typescript
// src/lib/auth/rate-limit.ts:31-35

interface LockoutEntry {
  until: number;     // Lockout end timestamp (ms)
  reason: string;    // Lockout reason
  attempts: number;  // Failed attempts before lockout
}
```

### Example Lockout Entry

```json
{
  "until": 1702503600000,
  "reason": "Too many failed login attempts",
  "attempts": 20
}
```

### FailedAttempts Data

```json
{
  "attempts": 5,
  "lastAttempt": 1702500000000
}
```

---

## Token Data Models

### Confirmation Token

Stored in `confirm:{token}` key:
- **Value:** User ID (string)
- **TTL:** 24 hours

### Reset Token Data

```typescript
interface ResetTokenData {
  userId: string;
  email: string;
  createdAt: string;  // ISO 8601
  expiresAt: string;  // ISO 8601
}
```

Stored in `reset:{token}` key with 1-hour TTL.

### Example Reset Token Entry

```json
{
  "userId": "johndoe",
  "email": "john@example.com",
  "createdAt": "2025-12-14T10:00:00.000Z",
  "expiresAt": "2025-12-14T11:00:00.000Z"
}
```

---

## KV Key Patterns

### User Keys

| Pattern | Example | Description |
|---------|---------|-------------|
| `user:{id}` | `user:johndoe` | Primary user data |
| `email:{email}` | `email:john@example.com` | Email → user ID index |

### Token Keys

| Pattern | Example | TTL | Description |
|---------|---------|-----|-------------|
| `confirm:{token}` | `confirm:a1b2c3...` | 24h | Email confirmation token |
| `reset:{token}` | `reset:d4e5f6...` | 1h | Password reset token |

### Session Keys

| Pattern | Example | TTL | Description |
|---------|---------|-----|-------------|
| `session:{token}` | `session:9876543...` | 24h | Active session |

### Rate Limit Keys

| Pattern | Example | TTL | Description |
|---------|---------|-----|-------------|
| `rate:login:ip:{ip}` | `rate:login:ip:1.2.3.4` | ~23min | IP login rate |
| `rate:login:email:{email}` | `rate:login:email:x@y.com` | ~1.5h | Email login rate |
| `rate:register:ip:{ip}` | `rate:register:ip:1.2.3.4` | ~1.5h | IP register rate |
| `rate:register:daily` | `rate:register:daily` | ~36h | Global daily registrations |

### Security Keys

| Pattern | Example | TTL | Description |
|---------|---------|-----|-------------|
| `failed:{email}` | `failed:john@example.com` | 1h | Failed attempt counter |
| `lockout:{email}` | `lockout:john@example.com` | 1h | Account lockout |

---

## TTL Configuration

### Time Constants

```typescript
// src/lib/auth/kv-auth.ts
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;    // 24 hours
const RESET_TOKEN_DURATION_MS = 60 * 60 * 1000;     // 1 hour
const CONFIRM_TOKEN_DURATION = 24 * 60 * 60;        // 24 hours (seconds)

// src/lib/auth/rate-limit.ts
const RATE_LIMITS = {
  login: {
    ip: { windowMs: 15 * 60 * 1000 },      // 15 minutes
    email: { windowMs: 60 * 60 * 1000 },   // 1 hour
  },
  register: {
    ip: { windowMs: 60 * 60 * 1000 },      // 1 hour
    global: { windowMs: 24 * 60 * 60 * 1000 }, // 24 hours
  },
};

const LOCKOUT_CONFIG = {
  lockoutDuration: 60 * 60 * 1000,  // 1 hour
};
```

### TTL Summary

| Data Type | TTL | Notes |
|-----------|-----|-------|
| User data | Permanent | No expiration |
| Email index | Permanent | No expiration |
| Session | 24 hours | Auto-logout |
| Confirmation token | 24 hours | Must confirm within 24h |
| Reset token | 1 hour | Security measure |
| Rate limit (login IP) | ~23 minutes | 1.5x window |
| Rate limit (login email) | ~1.5 hours | 1.5x window |
| Rate limit (register) | ~1.5 hours | 1.5x window |
| Rate limit (daily) | ~36 hours | 1.5x window |
| Failed attempts | 1 hour | Auto-clear |
| Account lockout | 1 hour | Auto-unlock |

---

## TypeScript Interfaces

### Complete Type Definitions

```typescript
// src/lib/auth/kv-auth.ts

// Primary user data
export interface KVUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'admin' | 'editor' | 'contributor' | 'viewer';
  accessLevel: number;
  avatar: string;
  bio: string;
  createdAt: string;
  emailConfirmed: boolean;
  confirmToken?: string;
  confirmTokenExpires?: string;
}

// Session data
export interface KVSession {
  userId: string;
  createdAt: string;
  expiresAt: string;
}

// Public user data (without sensitive fields)
export type PublicUser = Omit<KVUser, 'passwordHash' | 'confirmToken' | 'confirmTokenExpires'>;
```

### Rate Limiting Types

```typescript
// src/lib/auth/rate-limit.ts

interface RateEntry {
  count: number;
  windowStart: number;
}

interface LockoutEntry {
  until: number;
  reason: string;
  attempts: number;
}

interface FailedAttempts {
  attempts: number;
  lastAttempt: number;
}
```

### Permission Types

```typescript
// src/lib/auth/permissions.ts

export type Operation = 'create' | 'read' | 'update' | 'delete' | 'manage_users' | 'system_settings';

export interface PermissionResult {
  granted: boolean;
  reason: string;
}

export const ACCESS_LEVELS = {
  ADMIN: 10,
  EDITOR: 5,
  CONTRIBUTOR: 3,
  VIEWER: 1,
  NONE: 0,
} as const;
```

---

## Data Operations

### User Operations

```typescript
// Create user
async function createUser(
  users: KVNamespace,
  data: { username: string; name: string; email: string; password: string }
): Promise<{ user: KVUser; confirmToken: string }>

// Get user by ID
async function getUserById(
  users: KVNamespace,
  id: string
): Promise<KVUser | null>

// Get user by email
async function getUserByEmail(
  users: KVNamespace,
  email: string
): Promise<KVUser | null>

// Validate credentials
async function validateCredentials(
  users: KVNamespace,
  email: string,
  password: string
): Promise<KVUser | null>

// Sanitize user (remove sensitive fields)
function sanitizeUser(user: KVUser): PublicUser
```

### Session Operations

```typescript
// Create session
async function createSession(
  sessions: KVNamespace,
  userId: string
): Promise<{ token: string; expiresAt: Date }>

// Get session
async function getSession(
  sessions: KVNamespace,
  token: string
): Promise<KVSession | null>

// Delete session
async function deleteSession(
  sessions: KVNamespace,
  token: string
): Promise<void>
```

### Token Operations

```typescript
// Confirm email
async function confirmEmail(
  users: KVNamespace,
  token: string
): Promise<KVUser | null>

// Create password reset
async function createPasswordReset(
  users: KVNamespace,
  email: string
): Promise<{ resetToken: string; user: KVUser } | null>

// Reset password
async function resetPassword(
  users: KVNamespace,
  token: string,
  newPassword: string
): Promise<boolean>
```

### Rate Limiting Operations

```typescript
// Check rate limit
async function checkRateLimit(
  kv: KVNamespace,
  action: 'login' | 'register',
  identifier: { ip: string; email?: string }
): Promise<{ allowed: boolean; retryAfter?: number; reason?: string }>

// Record action
async function recordRateLimitedAction(
  kv: KVNamespace,
  action: 'login' | 'register',
  identifier: { ip: string; email?: string },
  success: boolean
): Promise<void>

// Check account lockout
async function checkAccountLockout(
  kv: KVNamespace,
  email: string
): Promise<{ locked: boolean; until?: number; reason?: string }>
```

---

## Data Flow Diagrams

### User Registration Flow

```
1. POST /api/auth/register
   │
   ├── Check rate limit
   │   └── GET rate:register:ip:{ip}
   │
   ├── Validate email uniqueness
   │   └── GET email:{email}
   │
   ├── Create user
   │   ├── PUT user:{id} (KVUser JSON)
   │   ├── PUT email:{email} (user ID)
   │   └── PUT confirm:{token} (user ID, TTL: 24h)
   │
   └── Record rate limit action
       └── PUT rate:register:ip:{ip}
```

### Login Flow

```
1. POST /api/auth/login
   │
   ├── Check account lockout
   │   └── GET lockout:{email}
   │
   ├── Check rate limit
   │   ├── GET rate:login:ip:{ip}
   │   └── GET rate:login:email:{email}
   │
   ├── Validate credentials
   │   ├── GET email:{email} → userId
   │   └── GET user:{userId} → KVUser
   │
   ├── Create session (if success)
   │   └── PUT session:{token} (KVSession, TTL: 24h)
   │
   └── Record rate limit action
       ├── PUT rate:login:ip:{ip}
       ├── PUT rate:login:email:{email} (if failed)
       └── PUT failed:{email} (if failed)
```

---

## Related Documentation

- [Authentication](./AUTHENTICATION.md) - Auth system details
- [API Reference](./API_REFERENCE.md) - API endpoints
- [Security](./SECURITY.md) - Security measures
