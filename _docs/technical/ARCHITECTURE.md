# Technical Architecture

> Complete system architecture documentation for How To Win Capitalism
>
> Last Updated: 2025-12-14

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Tech Stack](#tech-stack)
3. [Architectural Patterns](#architectural-patterns)
4. [Request Flow](#request-flow)
5. [Directory Structure](#directory-structure)
6. [Component Architecture](#component-architecture)
7. [State Management](#state-management)
8. [Data Flow](#data-flow)
9. [Build System](#build-system)
10. [Design Decisions](#design-decisions)

---

## System Overview

How To Win Capitalism is a server-side rendered web application built with Astro, deployed on Cloudflare Pages, using Cloudflare KV for data storage.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────┐    ┌───────────────────┐    ┌───────────────────┐   │
│  │   Web Browser     │    │   httpOnly        │    │   nanostores      │   │
│  │   (HTML/CSS/JS)   │    │   Session Cookie  │    │   (Client State)  │   │
│  └───────────────────┘    └───────────────────┘    └───────────────────┘   │
│                                                                              │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           APPLICATION LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────┐    ┌───────────────────┐    ┌───────────────────┐   │
│  │   Astro SSR       │    │   API Routes      │    │   Middleware      │   │
│  │   Pages           │───▶│   (/api/*)        │───▶│   (Auth, CSRF)    │   │
│  └───────────────────┘    └───────────────────┘    └───────────────────┘   │
│                                                                              │
│  ┌───────────────────┐    ┌───────────────────┐    ┌───────────────────┐   │
│  │   Components      │    │   Layouts         │    │   Content         │   │
│  │   (Atomic Design) │    │   (Base.astro)    │    │   (MDX Pages)     │   │
│  └───────────────────┘    └───────────────────┘    └───────────────────┘   │
│                                                                              │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            SERVICE LAYER                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────┐    ┌───────────────────┐    ┌───────────────────┐   │
│  │   Auth Module     │    │   Rate Limiting   │    │   Email Service   │   │
│  │   (kv-auth.ts)    │    │   (rate-limit.ts) │    │   (Resend API)    │   │
│  └───────────────────┘    └───────────────────┘    └───────────────────┘   │
│                                                                              │
│  ┌───────────────────┐    ┌───────────────────┐    ┌───────────────────┐   │
│  │   Permissions     │    │   CSRF Module     │    │   Turnstile       │   │
│  │   (RBAC)          │    │   (csrf.ts)       │    │   (CAPTCHA)       │   │
│  └───────────────────┘    └───────────────────┘    └───────────────────┘   │
│                                                                              │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             DATA LAYER                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                      CLOUDFLARE KV STORAGE                             │  │
│  ├───────────────────┬───────────────────┬───────────────────────────────┤  │
│  │   USERS           │   SESSIONS        │   Rate/Lockout Data           │  │
│  │   Namespace       │   Namespace       │   (in USERS namespace)        │  │
│  ├───────────────────┼───────────────────┼───────────────────────────────┤  │
│  │ user:{id}         │ session:{token}   │ rate:login:ip:{ip}            │  │
│  │ email:{email}     │                   │ rate:login:email:{email}      │  │
│  │ confirm:{token}   │                   │ lockout:{email}               │  │
│  │ reset:{token}     │                   │ failed:{email}                │  │
│  └───────────────────┴───────────────────┴───────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Core Technologies

| Technology | Version | Purpose | Location |
|------------|---------|---------|----------|
| **Astro** | 5.x | SSR framework | `astro.config.mjs` |
| **TypeScript** | 5.x | Type safety | `tsconfig.json` |
| **Cloudflare Pages** | - | Edge hosting | `wrangler.toml` |
| **Cloudflare KV** | - | Key-value storage | `wrangler.toml` |

### Supporting Technologies

| Technology | Purpose | Location |
|------------|---------|----------|
| **nanostores** | Client-side state | `src/lib/auth/store.ts` |
| **Resend** | Email delivery | `src/lib/email/` |
| **Playwright** | E2E testing | `tests/*.spec.ts` |
| **Vitest** | Unit testing | `*.test.ts` files |

### CSS Architecture

| Aspect | Approach | Location |
|--------|----------|----------|
| **Design Tokens** | CSS Custom Properties | `src/styles/custom.css` |
| **Component Styles** | Scoped `<style>` blocks | Each `.astro` file |
| **Theme** | Wikipedia-inspired minimal | `src/styles/custom.css` |

---

## Architectural Patterns

### 1. Layered Architecture

The application follows a strict layered architecture where each layer has a specific responsibility:

```
┌─────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                          │
│   - Astro pages & components                                    │
│   - HTML/CSS/JS output                                          │
│   - No business logic                                           │
├─────────────────────────────────────────────────────────────────┤
│                     APPLICATION LAYER                           │
│   - API routes (orchestration)                                  │
│   - Request/response handling                                   │
│   - Input validation                                            │
├─────────────────────────────────────────────────────────────────┤
│                      SERVICE LAYER                              │
│   - Business logic                                              │
│   - Auth, permissions, rate limiting                            │
│   - External service integration                                │
├─────────────────────────────────────────────────────────────────┤
│                       DATA LAYER                                │
│   - KV storage operations                                       │
│   - Data serialization                                          │
│   - TTL management                                              │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Dependency Injection (Implicit)

KV namespaces are passed as parameters to functions rather than being global:

```typescript
// src/lib/auth/kv-auth.ts:293-305
export async function validateCredentials(
  users: KVNamespace,    // ← Injected dependency
  email: string,
  password: string
): Promise<KVUser | null> {
  const user = await getUserByEmail(users, email);
  if (!user) return null;
  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) return null;
  return user;
}
```

**Benefits:**
- Testable (can mock KV namespace)
- No global state
- Explicit dependencies

### 3. Single Source of Truth

Data flows through a strict hierarchy:

```
┌─────────────────────────────────────────────────────────────────┐
│               CLOUDFLARE KV (Authoritative)                     │
│                          │                                      │
│                          ▼                                      │
│               API Response (Validated)                          │
│                          │                                      │
│                          ▼                                      │
│               userStore (nanostores)                            │
│                          │                                      │
│                          ▼                                      │
│               authStore (Client-side Sync)                      │
│                          │                                      │
│                          ▼                                      │
│               UI Components (Subscribe)                         │
└─────────────────────────────────────────────────────────────────┘
```

### 4. Atomic Design Pattern

Components are organized by complexity level:

```
src/components/
├── atoms/              # Base building blocks
│   ├── WikiBox.astro   # Container component
│   ├── Avatar.astro    # User avatar
│   └── Breadcrumbs.astro
├── molecules/          # Composed components
│   ├── DecisionMatrix.astro
│   ├── LoginForm.astro
│   └── InfoBox.astro
├── organisms/          # Complex sections
│   ├── PageHeader.astro
│   ├── Footer.astro
│   └── Profile/
└── utilities/          # Helper components
    └── Empty.astro
```

### 5. Feature Flag Pattern (Environment-Based)

Graceful fallback between production and development:

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

## Request Flow

### Authentication Request Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────▶│  API     │────▶│  Auth    │────▶│   KV     │
│  Form    │     │  Route   │     │  Module  │     │  Store   │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                │                │                │
     │ POST /api/auth/login            │                │
     │ {email, password, csrf_token}   │                │
     │ ──────────────▶│                │                │
     │                │                │                │
     │                │ 1. Validate CSRF               │
     │                │ ──────────────▶│                │
     │                │                │                │
     │                │ 2. Check Rate Limit            │
     │                │ ──────────────▶│                │
     │                │                │                │
     │                │ 3. Check Lockout               │
     │                │ ──────────────▶│──────────────▶│
     │                │                │◀──────────────│
     │                │                │                │
     │                │ 4. Validate Credentials        │
     │                │ ──────────────▶│──────────────▶│
     │                │                │◀──────────────│
     │                │                │                │
     │                │ 5. Create Session              │
     │                │ ──────────────▶│──────────────▶│
     │                │                │◀──────────────│
     │                │◀───────────────│                │
     │                │                │                │
     │ Response + Set-Cookie           │                │
     │◀────────────── │                │                │
```

### Page Request Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Browser │────▶│  Astro   │────▶│  Layout  │────▶│  Page    │
│          │     │  Router  │     │          │     │ Component│
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                │                │                │
     │ GET /notes/    │                │                │
     │ Cookie: htwc_session=xxx        │                │
     │ ──────────────▶│                │                │
     │                │                │                │
     │                │ 1. Check session cookie         │
     │                │ ──────────────▶│                │
     │                │                │                │
     │                │ 2. Load layout │                │
     │                │ ──────────────▶│                │
     │                │                │                │
     │                │                │ 3. Render page │
     │                │                │ ──────────────▶│
     │                │                │◀───────────────│
     │                │◀───────────────│                │
     │                │                │                │
     │ HTML Response  │                │                │
     │◀────────────── │                │                │
```

---

## Directory Structure

### Root Level

```
howtowincapitalism/
├── _docs/                    # Internal documentation
├── _planning/                # Johnny Decimal task organization
├── _work_efforts/            # Tracked work items
├── public/                   # Static assets (copied to dist/)
│   ├── _headers              # Cloudflare security headers
│   ├── _redirects            # Cloudflare redirects
│   ├── favicon.svg           # Site favicon
│   └── og-image.png          # Social share image
├── scripts/                  # Build automation scripts
├── src/                      # Application source code
├── tests/                    # E2E tests (Playwright)
├── astro.config.mjs          # Astro configuration
├── package.json              # Dependencies
├── playwright.config.ts      # E2E test configuration
├── tsconfig.json             # TypeScript configuration
├── vitest.config.ts          # Unit test configuration
└── wrangler.toml             # Cloudflare Workers configuration
```

### Source Directory (`src/`)

```
src/
├── components/               # Astro components
│   ├── atoms/                # Base building blocks
│   │   ├── WikiBox.astro     # Core container component
│   │   ├── Avatar.astro      # User avatar display
│   │   ├── Breadcrumbs.astro # Navigation breadcrumbs
│   │   ├── Collapsible.astro # Expandable sections
│   │   └── RoleBadge.astro   # User role indicator
│   ├── molecules/            # Composed components
│   │   ├── DecisionMatrix.astro
│   │   ├── LoginForm.astro
│   │   ├── RegisterForm.astro
│   │   ├── Disclaimer.astro
│   │   ├── InfoBox.astro
│   │   ├── NoteBox.astro
│   │   ├── FAQ.astro
│   │   └── TopicCard.astro
│   ├── organisms/            # Complex sections
│   │   ├── PageHeader.astro
│   │   ├── Footer.astro
│   │   └── Profile/
│   ├── auth/                 # Auth-specific components
│   │   ├── UserMenu.astro
│   │   └── AuthStatus.astro
│   ├── guards/               # Access control components
│   │   └── OwnerGuard.astro
│   ├── search/               # Search functionality
│   └── simple/               # Simple utility components
├── content/                  # MDX content pages
│   ├── docs/                 # Main content
│   │   ├── index.mdx         # Home page
│   │   ├── faq/              # FAQ section
│   │   ├── notes/            # Notes section
│   │   └── tools/            # Tools section
│   └── users/                # User profile content
├── layouts/                  # Page layouts
│   └── Base.astro            # Main layout template
├── lib/                      # TypeScript utilities
│   ├── auth/                 # Authentication system
│   │   ├── kv-auth.ts        # Cloudflare KV auth (611 lines)
│   │   ├── local-auth.ts     # Development fallback
│   │   ├── store.ts          # Client-side auth state
│   │   ├── userStore.ts      # User data store
│   │   ├── permissions.ts    # RBAC access control (225 lines)
│   │   ├── rate-limit.ts     # Rate limiting (273 lines)
│   │   ├── csrf.ts           # CSRF protection (176 lines)
│   │   ├── turnstile.ts      # CAPTCHA verification
│   │   ├── activity.ts       # Activity tracking
│   │   ├── api-client.ts     # Client-side API wrapper
│   │   └── index.ts          # Module exports
│   ├── api/                  # API utilities
│   ├── email/                # Email templates
│   │   └── templates.ts      # Email HTML templates
│   ├── tools/                # Reusable tools
│   │   ├── decision-matrix.ts # Decision matrix (924 lines)
│   │   └── index.ts          # Tool exports
│   ├── config/               # Configuration
│   ├── constants.ts          # App-wide constants
│   └── debug.ts              # Development logging
├── pages/                    # Route pages
│   ├── api/                  # API endpoints
│   │   ├── auth/             # Auth endpoints (8 files)
│   │   └── admin/            # Admin endpoints (3 files)
│   ├── login.astro           # Login page
│   ├── register.astro        # Registration page
│   ├── profile/              # Profile pages
│   └── users/                # User directory pages
└── styles/
    └── custom.css            # Design tokens & global styles
```

---

## Component Architecture

### Atomic Design Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                          PAGES                                   │
│   Complete pages built from organisms                           │
│   Example: src/pages/login.astro                                │
├─────────────────────────────────────────────────────────────────┤
│                        ORGANISMS                                 │
│   Complex UI sections composed of molecules                     │
│   Example: PageHeader, Footer, ProfileForm                      │
├─────────────────────────────────────────────────────────────────┤
│                        MOLECULES                                 │
│   Functional UI groups composed of atoms                        │
│   Example: LoginForm, DecisionMatrix, InfoBox                   │
├─────────────────────────────────────────────────────────────────┤
│                          ATOMS                                   │
│   Basic building blocks, single-purpose                         │
│   Example: WikiBox, Avatar, RoleBadge                           │
└─────────────────────────────────────────────────────────────────┘
```

### Component Composition Example

```astro
<!-- DecisionMatrix (Molecule) composes WikiBox (Atom) -->

---
import WikiBox from '../atoms/WikiBox.astro';

export interface Props {
  result: DecisionResultData;
  title?: string;
  showBreakdown?: boolean;
}

const { result, title = 'Decision Analysis', showBreakdown = true } = Astro.props;
---

<WikiBox variant="info" title={title}>
  <div class="dm-winner">
    Winner: <strong>{result.winner}</strong>
  </div>
  <table class="dm-table">
    <!-- Table content -->
  </table>
</WikiBox>
```

---

## State Management

### Client-Side State with nanostores

```
┌─────────────────────────────────────────────────────────────────┐
│                    STATE ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐          ┌─────────────────┐               │
│  │   userStore     │          │   authStore     │               │
│  │   (Users DB)    │───sync──▶│   (Auth State)  │               │
│  └─────────────────┘          └─────────────────┘               │
│         │                             │                          │
│         │                             │                          │
│         ▼                             ▼                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    UI Components                         │    │
│  │   Subscribe to stores and auto-update on changes        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### State Flow

```typescript
// 1. Login: API validates → creates session → returns user
const response = await fetch('/api/auth/login', {...});
const data = await response.json();

// 2. Client stores user data
userStore.setKey(data.user.id, data.user);

// 3. Auth store syncs
authStore.set({
  isAuthenticated: true,
  user: data.user,
});

// 4. Components auto-update via subscription
authStore.subscribe((state) => {
  // Re-render with new state
});
```

---

## Data Flow

### Authentication Data Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION DATA FLOW                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. USER SUBMITS LOGIN FORM                                       │
│     └─▶ POST /api/auth/login {email, password, csrf_token}       │
│                                                                   │
│  2. API ROUTE VALIDATES                                           │
│     ├─▶ Validate CSRF token                                       │
│     ├─▶ Check rate limit (IP + email)                            │
│     ├─▶ Check account lockout                                     │
│     └─▶ Validate credentials (KV lookup + password verify)       │
│                                                                   │
│  3. SESSION CREATED IN KV                                         │
│     └─▶ session:{token} = {userId, createdAt, expiresAt}         │
│                                                                   │
│  4. RESPONSE WITH SET-COOKIE                                      │
│     └─▶ Set-Cookie: htwc_session={token}; HttpOnly; Secure       │
│                                                                   │
│  5. BROWSER STORES COOKIE AUTOMATICALLY                           │
│     └─▶ All subsequent requests include cookie                   │
│                                                                   │
│  6. SUBSEQUENT REQUESTS                                           │
│     ├─▶ Cookie sent automatically                                │
│     ├─▶ Server validates session                                 │
│     └─▶ Returns user data or 401                                 │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Build System

### Build Pipeline

```
┌──────────────────────────────────────────────────────────────────┐
│                      BUILD PIPELINE                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. npm run build                                                 │
│     │                                                             │
│     ├─▶ TypeScript compilation (tsc)                             │
│     │   └─▶ Type checking                                        │
│     │                                                             │
│     ├─▶ Astro build                                              │
│     │   ├─▶ SSR pages                                            │
│     │   ├─▶ Component compilation                                │
│     │   ├─▶ MDX processing                                       │
│     │   └─▶ Asset optimization                                   │
│     │                                                             │
│     └─▶ Output to dist/                                          │
│         ├─▶ _worker.js (Cloudflare Worker)                       │
│         ├─▶ Static assets                                        │
│         └─▶ _routes.json (routing config)                        │
│                                                                   │
│  2. npm run deploy                                                │
│     │                                                             │
│     └─▶ wrangler pages deploy dist                               │
│         └─▶ Upload to Cloudflare Pages                           │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `astro dev` | Development server |
| `build` | `astro build` | Production build |
| `preview` | `astro preview` | Preview production locally |
| `check` | `astro check` | Type validation |
| `deploy` | `wrangler pages deploy dist` | Deploy to Cloudflare |
| `ship` | `scripts/ship.mjs` | Build + Commit + Push + Deploy |

---

## Design Decisions

### Why Astro?

| Requirement | Astro Solution |
|-------------|----------------|
| Server-side rendering | Native SSR support |
| TypeScript | First-class support |
| Cloudflare deployment | Official adapter |
| Component islands | Partial hydration |
| Content authoring | MDX support |

### Why Cloudflare KV?

| Requirement | KV Solution |
|-------------|-------------|
| Low latency | Edge-replicated |
| Simple key-value | Perfect for sessions |
| TTL support | Auto-expiring sessions |
| Serverless | No database to manage |
| Cost | Generous free tier |

### Why nanostores?

| Requirement | nanostores Solution |
|-------------|---------------------|
| Lightweight | 1KB gzipped |
| Framework agnostic | Works with Astro |
| Persistence | localStorage support |
| Reactivity | Subscribe pattern |

### Security-First Design

All security measures are enabled by default:

| Feature | Status | Rationale |
|---------|--------|-----------|
| PBKDF2 hashing | Enabled | Industry standard |
| httpOnly cookies | Enabled | XSS prevention |
| CSRF tokens | Enabled | CSRF prevention |
| Rate limiting | Enabled | Brute force prevention |
| Account lockout | Enabled | Credential stuffing prevention |
| Email confirmation | Enabled | Email verification |

---

## Related Documentation

- [Authentication](./AUTHENTICATION.md) - Detailed auth system docs
- [API Reference](./API_REFERENCE.md) - All API endpoints
- [Security](./SECURITY.md) - Security measures and threat model
- [Deployment](./DEPLOYMENT.md) - Deployment process and configuration
