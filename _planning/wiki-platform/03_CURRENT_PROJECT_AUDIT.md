# Current Project Audit: howtowincapitalism

**Date:** 2025-12-14
**Status:** Complete

## Executive Summary

The current project has a solid foundation for a wiki-like system but lacks user-editing capabilities. It's essentially a developer-authored wiki with authentication and permissions.

## What Already Exists

### 1. Authentication System

**Server-Side (Production):**
- Cloudflare KV storage for users and sessions
- CSRF protection
- Rate limiting with account lockout
- Email confirmation flow
- Password reset flow
- Session cookies (HTTP-only)

**Server-Side (Local Dev):**
- In-memory mock authentication
- Same API interface as production
- Test credentials for all roles

**Client-Side:**
- nanostores for reactive state
- localStorage persistence for user profiles
- API client for auth operations

**Location:** `src/lib/auth/`

**Status:** ✅ Complete and working

---

### 2. User Management

**Roles and Access Levels:**
| Role | Level | Can Create | Can Read | Can Update | Can Delete |
|------|-------|------------|----------|------------|------------|
| Admin | 10 | All | All | All | All |
| Editor | 5 | All | All | All | None |
| Contributor | 3 | Own | Public + Own | Own | None |
| Viewer | 1 | None | Public | None | None |

**User Profile Data:**
```typescript
interface UserProfile {
  // Immutable
  id: string;
  email: string;
  role: UserRole;
  accessLevel: number;
  createdAt: string;

  // Editable by user
  name: string;
  avatar: string;
  bio: string;

  // Editable by admin
  isActive: boolean;
}
```

**Location:** `src/lib/auth/userStore.ts`

**Status:** ✅ Well-designed, documented

---

### 3. Permissions System (RBAC)

**Features:**
- Hierarchical access levels (higher inherits lower)
- Operation-based checks (create, read, update, delete)
- Owner-based access for contributors
- Resource visibility (public, private, team)
- Convenience methods (`can.update()`, `isAdmin()`, etc.)

**Location:** `src/lib/auth/permissions.ts`

**Status:** ✅ Complete, well-documented

---

### 4. Content System

**Collections (Astro Content Collections):**

```
src/content/
├── users/           # User profiles (build-time)
│   ├── admin.md
│   ├── editor.md
│   ├── contributor.md
│   └── viewer.md
├── tools/           # Owned assets
│   └── nova-scraper.md
└── docs/            # Wiki content (FAQ, Notes, Tools guides)
    ├── faq/         # 11 FAQ articles
    ├── notes/       # 5 Notes
    └── tools/       # 4 Tool guides
```

**Schema (from `src/content.config.ts`):**
- `users`: name, role, avatar, accessLevel
- `tools`: title, description, owner (ref), visibility, type, status
- `docs`: title, description, owner (optional ref), visibility

**Status:** ✅ Good foundation, but **developer-only editing**

---

### 5. UI Components

**Component Library (`src/components/`):**

| Category | Components | Status |
|----------|------------|--------|
| Atoms | Avatar, Breadcrumbs, Collapsible, RoleBadge, WikiBox | ✅ |
| Auth | LoginForm, RegisterForm, UserMenu, etc. | ✅ |
| Guards | OwnerGuard | ✅ |
| Molecules | FAQ, Favorites, SeeAlso, TopicCard, etc. | ✅ |
| Organisms | Footer, Hero, PageHeader, Profile components | ✅ |
| Search | GlobalSearch | ⚠️ Basic |

**Status:** ✅ Solid component library, Wikipedia-inspired styling

---

### 6. API Routes

**Auth API (`src/pages/api/auth/`):**
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Clear session
- `GET /api/auth/me` - Get current user
- `POST /api/auth/register` - Create account
- `GET /api/auth/confirm` - Email confirmation
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Complete reset

**Admin API (`src/pages/api/admin/`):**
- `GET /api/admin/users/list` - List all users
- `POST /api/admin/users/create` - Create user
- `PUT /api/admin/users/[id]` - Update user
- `DELETE /api/admin/users/[id]` - Delete user

**Account API:**
- `GET /api/auth/account/export` - GDPR data export
- `DELETE /api/auth/account` - Account deletion

**Status:** ✅ Comprehensive auth and admin APIs

---

### 7. Pages

| Page | Purpose | Status |
|------|---------|--------|
| `/` | Home dashboard | ✅ |
| `/login/` | Authentication | ✅ |
| `/register/` | Account creation | ✅ |
| `/profile/[id]` | User profile view | ✅ |
| `/profile/edit` | Edit own profile | ✅ |
| `/users/` | User directory | ✅ |
| `/faq/` | FAQ index | ✅ |
| `/notes/` | Notes index | ✅ |
| `/tools/` | Tools index | ✅ |
| `/disclaimer/` | Legal disclaimer | ✅ |
| `/admin/users/` | User management | ✅ |

**Status:** ✅ Core pages complete

---

## What's MISSING for Wiki Platform

### Critical Gaps

| Feature | Wikipedia | Wiki.js | Current Project |
|---------|-----------|---------|-----------------|
| User-editable content | ✅ | ✅ | ❌ Dev-only |
| Revision history | ✅ | ✅ | ❌ Git only |
| Diff viewer | ✅ | ✅ | ❌ |
| Talk/discussion pages | ✅ | ❌ | ❌ |
| Wikilinks | ✅ | ✅ | ❌ |
| Recent changes | ✅ | ✅ | ❌ |
| Watchlists | ✅ | ❌ | ❌ |
| Categories | ✅ | Tags | ❌ |
| Search | ✅ | ✅ | ⚠️ Basic |

### Priority 1: Content Editing

**Current State:**
- Content is MDX files edited by developers
- No web-based content editing
- No database for dynamic content

**What's Needed:**
- Database storage for user-generated content
- Web-based editor (Markdown or WYSIWYG)
- Save/preview workflow
- Permission checks on edit operations

### Priority 2: Revision History

**Current State:**
- Only Git history (not accessible to users)
- No revision tracking

**What's Needed:**
- Store content snapshots on each edit
- Track who edited, when, what changed
- Ability to view any historical version
- Diff viewer to compare versions

### Priority 3: Discussion System

**Current State:**
- No comments or discussions
- No forum functionality

**What's Needed:**
- Per-page talk/discussion threads
- Or global forum system
- Notifications for replies
- Moderation tools

---

## Reusability Assessment

### Can Reuse (High Value)

| Component | Reuse Potential | Notes |
|-----------|-----------------|-------|
| Auth system | 95% | Just needs database migration |
| Permissions RBAC | 100% | Already designed for wiki |
| User profiles | 90% | Add more fields as needed |
| API patterns | 90% | Extend for content APIs |
| Component library | 80% | Add editor components |
| Layout/styling | 100% | Wikipedia-like already |

### Needs Major Work

| Component | Current State | What's Needed |
|-----------|---------------|---------------|
| Content storage | Static MDX files | Database + API |
| Content editing | None | Full editor implementation |
| Revision tracking | None | Database schema + UI |
| Search | Basic | Full-text search engine |

### Probably Replace

| Component | Reason |
|-----------|--------|
| Astro Content Collections | Need dynamic content from DB |
| Static pages | Need server-rendered from DB |

---

## Architecture Comparison

### Current Architecture
```
┌──────────────────────────────────────────────────┐
│                  Astro Pages                      │
│  (Static + SSR, MDX content at build time)        │
├──────────────────────────────────────────────────┤
│              Content Collections                  │
│  (src/content/*.mdx - developer authored)         │
├──────────────────────────────────────────────────┤
│         Auth API + Cloudflare KV                  │
│  (Users, Sessions - separate from content)        │
└──────────────────────────────────────────────────┘
```

### Required Architecture for Wiki
```
┌──────────────────────────────────────────────────┐
│                  Astro Pages                      │
│  (SSR, content from database)                     │
├──────────────────────────────────────────────────┤
│               REST/GraphQL API                    │
│  (Content CRUD, revisions, search)                │
├──────────────────────────────────────────────────┤
│                   Database                        │
│  (D1/Supabase: pages, revisions, discussions)     │
├──────────────────────────────────────────────────┤
│              Auth (existing + DB)                 │
│  (Migrate from KV to unified database)            │
└──────────────────────────────────────────────────┘
```

---

## Recommendation

### Option A: Extend Current Project

**Pros:**
- Keeps existing auth, permissions, UI
- Incremental migration
- No new codebase to maintain

**Cons:**
- Need to rebuild content system
- Mixed static/dynamic could be confusing
- Astro may not be ideal for highly dynamic content

**Effort:** Medium-High (2-3 months for MVP)

### Option B: Start Fresh with Learnings

**Pros:**
- Clean architecture from start
- Pick optimal tech for wiki (Next.js, SvelteKit)
- Apply lessons from current project

**Cons:**
- Lose existing work
- Rebuild auth/permissions
- Longer initial timeline

**Effort:** High (3-4 months for MVP)

### Option C: Fork Wiki.js and Customize

**Pros:**
- Many features already built
- Active maintenance
- Faster to functional wiki

**Cons:**
- Less learning
- Constrained by Wiki.js architecture
- May not fit exact requirements

**Effort:** Low-Medium (1-2 months for customized wiki)

---

## Conclusion

The current project provides:
- ✅ Solid authentication foundation
- ✅ Well-designed permissions system
- ✅ Good component library
- ✅ Wikipedia-like styling

But lacks:
- ❌ User content editing
- ❌ Revision tracking
- ❌ Discussion features
- ❌ Database for dynamic content

**My recommendation:** Option A (Extend Current) if learning and ownership are priorities. The auth and permissions work is valuable and transferable.

---

## Next Steps

1. Define feature tiers (MVP vs future)
2. Make build vs fork decision
3. Choose technology stack (especially database)
4. Define first milestone
