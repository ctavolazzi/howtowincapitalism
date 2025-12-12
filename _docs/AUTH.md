# Authentication System

> **Last Updated:** 2025-12-10

## Overview

How To Win Capitalism uses **Cloudflare KV** for authentication storage and **httpOnly cookies** for session management. This is a proper server-side auth system (not localStorage-based).

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE KV                                │
├─────────────────────────────────────────────────────────────────┤
│  USERS namespace:                                               │
│    user:{id} → { email, passwordHash, role, accessLevel, ... } │
│    email:{email} → userId (lookup index)                       │
│                                                                 │
│  SESSIONS namespace:                                            │
│    session:{token} → { userId, expiresAt }                     │
│    (with TTL for auto-expiration)                              │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│           ASTRO API ROUTES (run on Cloudflare Workers)          │
├─────────────────────────────────────────────────────────────────┤
│  POST /api/auth/login   → Validate, create session, set cookie  │
│  POST /api/auth/logout  → Delete session, clear cookie          │
│  GET  /api/auth/me      → Get user from session cookie          │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                       CLIENT                                    │
├─────────────────────────────────────────────────────────────────┤
│  httpOnly cookie (XSS-resistant, auto-sent with requests)      │
│  No secrets in JavaScript or localStorage                       │
└─────────────────────────────────────────────────────────────────┘
```

## Auth Flow

```
User submits login form
       ↓
POST /api/auth/login
       ↓
Server validates credentials against KV
       ↓
Server creates session in SESSIONS KV (with TTL)
       ↓
Server returns Set-Cookie header (httpOnly, Secure, SameSite)
       ↓
Browser stores cookie automatically
       ↓
Subsequent requests include cookie automatically
       ↓
Server reads cookie, looks up session in KV
       ↓
Server returns user data or 401
```

## Test Credentials

> **Updated 2025-12-11** - Credentials rotated after GitGuardian security alert

| Email | Password | Role |
|-------|----------|------|
| admin@email.com | Adm!n_Secure_2024# | admin |
| editor@email.com | Ed!tor_Access_2024# | editor |
| contributor@email.com | Contr!b_Pass_2024# | contributor |
| viewer@email.com | V!ewer_Read_2024# | viewer |

## Setup

### 1. Create KV Namespaces (already done)

```bash
wrangler kv namespace create "USERS"
wrangler kv namespace create "SESSIONS"
```

### 2. Add Bindings to wrangler.toml

```toml
[[kv_namespaces]]
binding = "USERS"
id = "your-users-namespace-id"

[[kv_namespaces]]
binding = "SESSIONS"
id = "your-sessions-namespace-id"
```

### 3. Seed Users

```bash
npm run seed:users
```

This hashes passwords and uploads users to KV.

## API Endpoints

### POST /api/auth/login

**Request:**
```json
{
  "email": "admin@email.com",
  "password": "itcan'tbethateasy..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "admin",
    "email": "admin@email.com",
    "name": "Admin User",
    "role": "admin",
    "accessLevel": 10
  }
}
```
+ `Set-Cookie: htwc_session=<token>; HttpOnly; Secure; SameSite=Strict`

**Error Response (401):**
```json
{
  "error": "Invalid email or password"
}
```

### POST /api/auth/logout

Clears the session cookie.

**Response (200):**
```json
{
  "success": true
}
```
+ `Set-Cookie: htwc_session=; Expires=<past date>`

### GET /api/auth/me

**Authenticated Response (200):**
```json
{
  "authenticated": true,
  "user": {
    "id": "admin",
    "email": "admin@email.com",
    "name": "Admin User",
    "role": "admin",
    "accessLevel": 10
  }
}
```

**Unauthenticated Response (200):**
```json
{
  "authenticated": false,
  "user": null
}
```

## Client-Side Usage

### Check Auth

```typescript
import { checkAuth } from '../lib/auth/api-client';

const { authenticated, user } = await checkAuth();
if (!authenticated) {
  window.location.href = '/login/';
}
```

### Logout

```typescript
import { logout } from '../lib/auth/api-client';

await logout();
window.location.href = '/login/';
```

## Route Protection

### Protected Routes (require login)

| Route | Description |
|-------|-------------|
| `/` | Home page |
| `/faq/*` | FAQ content |
| `/notes/*` | Notes content |
| `/tools/*` | Tools content |
| `/users/` | Users directory |
| `/users/[id]/` | User profiles |
| `/profile/*` | Profile routes |

### Public Routes (no auth)

| Route | Reason |
|-------|--------|
| `/login/` | Entry point |
| `/disclaimer/` | Legal requirement |

## Security Features

| Feature | Implementation |
|---------|----------------|
| Password hashing | SHA-256 with salt |
| Session tokens | Cryptographically random (32 bytes) |
| Cookie security | httpOnly, Secure, SameSite=Strict |
| Session expiry | 7 days TTL in KV |
| XSS protection | No secrets in JavaScript |
| CSRF protection | SameSite=Strict cookie |

## Files Reference

### Server-Side

| File | Purpose |
|------|---------|
| `src/lib/auth/kv-auth.ts` | KV auth utilities |
| `src/pages/api/auth/login.ts` | Login endpoint |
| `src/pages/api/auth/logout.ts` | Logout endpoint |
| `src/pages/api/auth/me.ts` | Current user endpoint |
| `scripts/seed-users.mjs` | Seed users to KV |

### Client-Side

| File | Purpose |
|------|---------|
| `src/lib/auth/api-client.ts` | API client wrapper |
| `src/components/auth/LoginForm.astro` | Login form |
| `src/components/auth/UserMenu.astro` | Header user menu |

### Configuration

| File | Purpose |
|------|---------|
| `wrangler.toml` | KV namespace bindings |
| `src/env.d.ts` | TypeScript types for KV |

## RBAC Levels

| Role | Level | Capabilities |
|------|-------|--------------|
| admin | 10 | Full CRUD on everything |
| editor | 5 | Create, Read, Update any (no delete) |
| contributor | 3 | CRUD on own content only |
| viewer | 1 | Read public content only |

## Testing

### Running Tests

```bash
npm test              # Run all E2E tests
npm run test:ui       # Interactive Playwright UI
npm run test:report   # View HTML test report
```

### Test Coverage

The auth system has comprehensive E2E tests in `tests/auth.spec.ts`:

| Category | Tests |
|----------|-------|
| **Login Page** | Form display, error handling, success redirect |
| **Protected Routes** | Unauthenticated redirect, public route access |
| **Session Persistence** | Cookie persists across navigation |
| **Logout** | Clears session, redirects to login |
| **All User Roles** | Admin, editor, contributor, viewer login |
| **API Endpoints** | /api/auth/me, /api/auth/login, /api/auth/logout |

### Test Results

```
18 passed (33.2s)

✓ Login Page › displays login form
✓ Login Page › shows error for invalid credentials
✓ Login Page › successful login redirects to home
✓ Login Page › login with redirect parameter returns to original page
✓ Protected Routes › unauthenticated user is redirected to login
✓ Protected Routes › home page redirects unauthenticated users
✓ Protected Routes › users page redirects unauthenticated users
✓ Protected Routes › disclaimer page is public (no redirect)
✓ Session Persistence › session persists across page navigation
✓ Logout › logout clears session and redirects to login
✓ All User Roles › admin can login successfully
✓ All User Roles › editor can login successfully
✓ All User Roles › contributor can login successfully
✓ All User Roles › viewer can login successfully
✓ Auth API Endpoints › GET /api/auth/me returns unauthenticated
✓ Auth API Endpoints › POST /api/auth/login returns user data
✓ Auth API Endpoints › POST /api/auth/login returns error on invalid
✓ Auth API Endpoints › POST /api/auth/logout clears session
```

## Comparison: Old vs New

| Aspect | Old (localStorage) | New (Cloudflare KV) |
|--------|-------------------|---------------------|
| Storage | Browser localStorage | Cloudflare KV |
| Credentials | In JavaScript code | Hashed in KV |
| Sessions | localStorage token | httpOnly cookie |
| Validation | Client-side | Server-side |
| XSS risk | High (readable) | Low (httpOnly) |
| Expiration | None | 7-day TTL |
| Multi-device | No sync | Session per device |
