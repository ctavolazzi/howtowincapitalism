# Authentication System

> **Last Updated:** 2025-12-10

## Overview

How To Win Capitalism uses a **client-side mock authentication system** for UX demonstration purposes. There is no backend server—all auth state is stored in the browser's `localStorage`.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        AUTH FLOW                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  VISITOR ARRIVES                                                │
│       ↓                                                         │
│  ANY PROTECTED ROUTE                                            │
│       ↓                                                         │
│  Auth Gate (100ms hydration wait)                               │
│       ↓                                                         │
│  ┌─────────────┐        ┌─────────────┐                        │
│  │ NOT LOGGED  │  ───→  │  /login/    │                        │
│  │    IN       │        │ ?redirect=  │                        │
│  └─────────────┘        └─────────────┘                        │
│       │                        ↓                                │
│       │                 Login Form                              │
│       │                        ↓                                │
│       │                 Success → Redirect back                 │
│       ↓                                                         │
│  ┌─────────────┐                                               │
│  │  LOGGED IN  │  ───→  Show Content                           │
│  └─────────────┘                                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Data Stores

### 1. User Store (`src/lib/auth/userStore.ts`)

**Purpose:** Single source of truth for user data.

```typescript
// Immutable credentials (cannot be changed)
DEFAULT_USERS = {
  id, email, password, role, accessLevel, createdAt
}

// Editable profile data (persists to localStorage)
usersStore = {
  name, avatar, bio, isActive
}
```

### 2. Auth Store (`src/lib/auth/store.ts`)

**Purpose:** Tracks who is currently logged in.

```typescript
authStore = {
  isLoggedIn: 'true' | 'false',
  userId: string,
  name: string,
  avatar: string,
  role: string,
  accessLevel: number
}
```

### 3. Permissions (`src/lib/auth/permissions.ts`)

**Purpose:** RBAC access control checks.

| Role | Level | Capabilities |
|------|-------|--------------|
| admin | 10 | Full CRUD on everything |
| editor | 5 | Create, Read, Update any (no delete) |
| contributor | 3 | CRUD on own content only |
| viewer | 1 | Read public content only |

## Test Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@email.com | itcan'tbethateasy... | admin |
| editor@email.com | editor123 | editor |
| contributor@email.com | contrib123 | contributor |
| viewer@email.com | viewer123 | viewer |

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
| `/profile/` | Profile redirect |
| `/profile/edit/` | Edit profile |
| `/profile/me/` | My profile redirect |

### Public Routes (no auth)

| Route | Reason |
|-------|--------|
| `/login/` | Entry point |
| `/disclaimer/` | Legal requirement |

## Implementation

### Auth Gate Pattern

Every protected page uses this pattern:

```astro
<Base title="Page Title">
  <!-- Auth Gate -->
  <div id="auth-gate" class="auth-gate">
    <div class="loading-spinner"></div>
    <p>Loading...</p>
  </div>

  <div id="content" style="display: none;">
    <!-- Page content here -->
  </div>
</Base>

<script>
  import { authStore } from '../lib/auth';

  async function checkAuth() {
    // Wait for store to hydrate from localStorage
    await new Promise((r) => setTimeout(r, 100));

    const state = authStore.get();
    if (state.isLoggedIn !== 'true') {
      // Redirect to login with return URL
      window.location.href = '/login/?redirect=' + encodeURIComponent(window.location.pathname);
    } else {
      // Show content
      document.getElementById('auth-gate').style.display = 'none';
      document.getElementById('content').style.display = 'block';
    }
  }

  checkAuth();

  // Listen for logout while on page
  authStore.subscribe(() => {
    const state = authStore.get();
    if (state.isLoggedIn !== 'true') {
      window.location.href = '/login/';
    }
  });
</script>
```

### Login Form Redirect Handling

The login form checks for a `?redirect=` parameter:

```typescript
function getRedirectUrl(): string {
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get('redirect');
  // Only allow relative paths starting with /
  if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) {
    return redirect;
  }
  return '/'; // Default to home
}
```

### Login Page Auto-Redirect

If a logged-in user visits `/login/`, they're redirected away:

```typescript
async function checkIfAlreadyLoggedIn() {
  await new Promise((r) => setTimeout(r, 100));
  const state = authStore.get();
  if (state.isLoggedIn === 'true') {
    window.location.href = getRedirectUrl();
  }
}
```

## Why localStorage?

### Appropriate for This Project

| Reason | Explanation |
|--------|-------------|
| No backend | Static/SSR site on Cloudflare Pages |
| Client-side auth | Credentials checked in JavaScript |
| Demo scope | Simulating auth UX, not securing real data |
| Simplicity | Zero server dependencies |

### Alternatives Considered

| Option | Why Not |
|--------|---------|
| Cookies | Better for server-side sessions, but we have no server |
| sessionStorage | Dies when tab closes (bad UX) |
| IndexedDB | Async API, overkill for ~1KB of state |
| Server Sessions | Requires backend, database, token refresh |

### Trade-offs

| ✅ Pros | ❌ Cons |
|---------|---------|
| Simple sync API | XSS can read it |
| 5MB+ storage | No built-in expiration |
| Persists across tabs | Synchronous (minor) |
| Works offline | Same-origin only |
| Zero server dependency | |

### Production Warning

**This is NOT production-ready auth.** For real users with real secrets:

```
✗ localStorage for tokens

✓ HttpOnly cookies (XSS-resistant)
✓ Server-side sessions OR JWTs with short expiry
✓ Refresh token rotation
✓ CSRF protection
✓ Secure + SameSite cookie flags
```

## Files Reference

| File | Purpose |
|------|---------|
| `src/lib/auth/userStore.ts` | User data store |
| `src/lib/auth/store.ts` | Auth state store |
| `src/lib/auth/permissions.ts` | RBAC checks |
| `src/lib/auth/index.ts` | Public exports |
| `src/components/auth/LoginForm.astro` | Login form |
| `src/components/auth/UserMenu.astro` | Header user menu |
| `src/components/guards/OwnerGuard.astro` | RBAC UI protection |

## Debugging

Enable auth logging in browser console:

```javascript
localStorage.setItem('debug:auth', 'true');
```

View all available debug modules:

```javascript
localStorage.setItem('debug', 'true');
```
