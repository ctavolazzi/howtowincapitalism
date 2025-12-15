# Routing Strategy

## Home Page

**Canonical Route:** `/`
**File:** `src/pages/index.astro`

The home page is defined in `src/pages/index.astro` and takes precedence over any content collection index files.

## Content Collection Routes

**Pattern:** `/{collection}/{slug}/`
**Handler:** `src/pages/[...slug].astro`

Content collections (docs) are routed via the catch-all `[...slug].astro` page:
- `/faq/introduction/` → `src/content/docs/faq/introduction.mdx`
- `/notes/latest/` → `src/content/docs/notes/latest.mdx`
- `/tools/decision-matrix-template/` → `src/content/docs/tools/decision-matrix-template.mdx`

## Profile Routes

### Public Profiles (`/users/{id}/`)

**File:** `src/pages/users/[id].astro`
**Data Source:** Content collections (`src/content/users/*.md`)
**Purpose:** Public view of user profiles from content collections
**Features:**
- Static user data from markdown files
- Client-side auth check (redirects if not logged in)
- Edit functionality via localStorage (client-side only)

### SSR Profiles (`/profile/{id}/`)

**File:** `src/pages/profile/[id].astro`
**Data Source:** `src/lib/api/profileService.ts` (mock data, future: KV)
**Purpose:** Server-side rendered profiles with privacy filtering
**Features:**
- Privacy-aware: Different data shown based on viewer context
- Activity feed with filtering
- System bulletins injection
- Server-side session-based requester ID

### Self Profile (`/profile/me/`)

**File:** `src/pages/profile/me.astro`
**Purpose:** Redirects to current user's profile (`/profile/{currentUserId}/`)

### Profile Edit (`/profile/edit/`)

**File:** `src/pages/profile/edit.astro`
**Purpose:** Edit current user's profile (client-side updates to localStorage)

### Route Strategy

- **`/users/{id}`** - Public profiles from content collections (simpler, static)
- **`/profile/{id}`** - SSR profiles with privacy filtering (more complex, dynamic)

Both routes serve different purposes and can coexist.

## Route Priority

1. Exact page matches (`src/pages/index.astro` beats `src/pages/[...slug].astro`)
2. Content collection routes (`src/pages/[...slug].astro` handles docs collection)
3. API routes (`src/pages/api/**`)

## Unused Files

- `src/content/docs/index.mdx` - Not routed (home page is `src/pages/index.astro`)
