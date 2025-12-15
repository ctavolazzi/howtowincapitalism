# Architecture

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Astro v5 (SSR) |
| Layout | Custom Base.astro (Wikipedia-inspired) |
| Styling | Custom CSS (Wikipedia aesthetic) |
| Hosting | Cloudflare Pages |
| Search | Client-side search (GlobalSearch component) |

## Directory Structure

```
howtowincapitalism/
├── _docs/                    # Internal documentation (this folder)
├── dist/                     # Build output (git-ignored)
├── public/                   # Static assets
│   ├── _headers              # Cloudflare security headers
│   ├── _redirects            # Cloudflare redirects
│   ├── favicon.svg           # Site favicon
│   ├── og-image.png          # Social share image
│   └── site.webmanifest      # PWA manifest
├── scripts/                  # Build/dev scripts
│   ├── ship.mjs              # Deploy script
│   ├── new-page.mjs          # Create new content
│   └── generate-*.mjs        # Asset generation
├── src/
│   ├── components/           # Astro components
│   │   ├── atoms/            # Base components (WikiBox)
│   │   ├── molecules/        # Composed components (Disclaimer, DecisionMatrix)
│   │   ├── organisms/        # Complex components (PageHeader)
│   │   ├── utilities/        # Helper components (Empty)
│   │   └── index.ts          # Component registry
│   ├── content/docs/         # Markdown content
│   │   ├── faq/              # FAQ (core concepts)
│   │   ├── notes/            # Research and observations
│   │   └── tools/            # Templates and calculators
│   ├── lib/                  # Shared utilities
│   │   ├── constants.ts      # App constants
│   │   └── tools/            # Reusable utilities
│   │       ├── index.ts      # Tool exports
│   │       ├── decision-matrix.ts  # Decision matrix (924 lines)
│   │       └── README.md     # Tool documentation
│   └── styles/
│       └── custom.css        # All custom styling
├── astro.config.mjs          # Astro config (SSR with Cloudflare)
├── package.json              # Dependencies and scripts
└── wrangler.toml             # Cloudflare config
```

### Scripts

| Script | Purpose |
|--------|---------|
| `scripts/ship.mjs` | Build → commit → push → deploy |
| `scripts/new-page.mjs` | Scaffold a new MDX content page |
| `scripts/terminal-ambient-animation.mjs` | Optional idle terminal animation (manual trigger) |
| `scripts/generate-*.mjs` | Asset generation (icons, OG images) |

## Component Architecture

### Design Pattern: Atomic Design

```
Atoms → Molecules → Organisms → Pages
```

### Component Inventory (Updated 2025-12-09)

**Atoms** (src/components/atoms/)
| Component | Purpose | Pattern |
|-----------|---------|---------|
| `WikiBox.astro` | Base container with variants | Container |
| `Breadcrumbs.astro` | Navigation hierarchy | Breadcrumbs |
| `Collapsible.astro` | Expandable sections | Progressive Disclosure |

**Molecules** (src/components/molecules/)
| Component | Purpose | Pattern |
|-----------|---------|---------|
| `Disclaimer.astro` | Warning banner (closable) | Alert |
| `DecisionMatrix.astro` | Decision matrix renderer | Data Display |
| `TopicCard.astro` | Content preview cards | Cards |
| `SeeAlso.astro` | Related content links | Related Content |
| `FAQ.astro` | Q&A sections | FAQ |
| `BlankSlate.astro` | Empty state / onboarding | Blank Slate |
| `CompletenessMeter.astro` | Progress tracking | Completeness Meter |
| `InfoBox.astro` | Information callout | Alert (reserved) |
| `NoteBox.astro` | Note callout | Alert (reserved) |
| `NavBox.astro` | Navigation box | Navigation (reserved) |
| `CallToAction.astro` | CTA with button | CTA (reserved) |

**Organisms** (src/components/organisms/)
| Component | Purpose | Pattern |
|-----------|---------|---------|
| `Footer.astro` | Site-wide footer | Fat Footer |
| `Hero.astro` | Hero section | Hero (available, not used) |
| `PageHeader.astro` | Page header with title | Header (reserved) |
| `ContentSection.astro` | Content wrapper | Section (reserved) |

**Utilities** (src/components/utilities/)
| Component | Purpose |
|-----------|---------|
| `CardGrid.astro` | Responsive grid layout |
| `Empty.astro` | Placeholder for disabled Starlight components |

**Overrides** (src/components/overrides/)
| Component | Purpose |
|-----------|---------|
| `Header.astro` | Custom site header |

## Tools (src/lib/tools/)

Reusable TypeScript utilities for data processing and analysis.

### Decision Matrix

**File:** `decision-matrix.ts` (924 lines)
**Purpose:** Quantitative decision-making tool

**Features:**
- 4 analysis methods (weighted, normalized, ranking, best-worst)
- Confidence scoring
- Strength/weakness detection
- Recommendation generation

**Integration:**
```
┌─────────────────────────┐     ┌───────────────────────────┐
│  decision-matrix.ts     │────▶│  DecisionMatrix.astro     │
│  (logic layer)          │     │  (presentation layer)     │
└─────────────────────────┘     └───────────────────────────┘
         ▲                                  │
         │                                  ▼
    makeDecision()              Wikipedia-style HTML table
```

**Usage in MDX:**
```mdx
import DecisionMatrix from '../../components/molecules/DecisionMatrix.astro';
import { makeDecision } from '../../lib/tools';

export const result = makeDecision({ options, criteria, scores, weights });

<DecisionMatrix result={result} title="My Comparison" />
```

See `src/lib/tools/README.md` for full API documentation.

## Layout Structure

The site uses a custom `Base.astro` layout with:
- Simple header with site title and hamburger menu
- Main content area (max-width: 800px)
- Footer with disclaimer and links
- Cookie consent banner
- Skip-to-content link for accessibility

## Box Model / Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ <header>                                                │
│   [Site Title]                    [Hamburger Menu]     │
└─────────────────────────────────────────────────────────┘
│                                                         │
│ <main>                                                  │
│   [Content - max-width: 800px]                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
│ <footer>                                                │
│   [Disclaimer] [Copyright] [Links]                      │
└─────────────────────────────────────────────────────────┘
```

## CSS Architecture

### Design Tokens (custom.css)

```css
:root {
  /* Spacing */
  --space-unit: 8px;
  --space-xs/sm/md/lg/xl/2xl

  /* Colors */
  --color-bg: #ffffff;
  --color-text: #202122;
  --color-link: #0645ad;
  --color-border: #a2a9b1;
  --color-surface: #f8f9fa;

  /* Typography */
  --font-sans: system fonts
  --font-serif: Georgia, Times
  --font-mono: monospace
  --text-xs/sm/base/lg/xl/2xl/3xl
}
```

### Design Token System

All design tokens are defined in `Base.astro` and can be overridden in `custom.css`:
```css
:root {
  --color-bg: #ffffff;
  --color-text: #202122;
  --color-link: #0645ad;
  /* etc. */
}
```

## Routing

See [`ROUTING.md`](ROUTING.md) for detailed routing strategy.

**Summary:**
- Home page: `src/pages/index.astro` (canonical `/`)
- Content routes: `src/pages/[...slug].astro` handles docs collection
- Profile routes: `/users/{id}` (public) vs `/profile/{id}` (SSR with privacy)

## Deployment

### Manual Deploy Process

```bash
npm run ship "commit message"
```

This runs:
1. `npm run build` - Verify code works
2. `git add -A && git commit` - Save changes
3. `git push` - Backup to GitHub
4. `wrangler pages deploy dist` - Deploy to Cloudflare

### CI/CD

GitHub Actions runs build validation on push (no auto-deploy).

## Authentication & Authorization

### Architecture (Added 2025-12-10)

```
┌─────────────────────────────────────────────────────────────────┐
│                    UNIFIED USER STORE                           │
│                 src/lib/auth/userStore.ts                       │
├─────────────────────────────────────────────────────────────────┤
│  DEFAULT_USERS (immutable)     usersStore (editable)           │
│  ├─ id, email, password        ├─ name                         │
│  ├─ role, accessLevel          ├─ avatar                       │
│  └─ createdAt                  └─ bio                          │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AUTH STORE                                 │
│                  src/lib/auth/store.ts                          │
├─────────────────────────────────────────────────────────────────┤
│  - Who is currently logged in                                   │
│  - Syncs with userStore on login                                │
│  - Auto-updates when profile changes                            │
│  - Persists to localStorage via nanostores                      │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PERMISSIONS                                  │
│               src/lib/auth/permissions.ts                       │
├─────────────────────────────────────────────────────────────────┤
│  checkPermission(operation, resourceOwner, visibility)          │
│  isOwner(), isAdmin(), can.read(), can.update(), can.delete()  │
└─────────────────────────────────────────────────────────────────┘
```

### Auth Files

| File | Purpose |
|------|---------|
| `userStore.ts` | Single source of truth for user data |
| `store.ts` | Auth state (who is logged in) |
| `permissions.ts` | RBAC access control |
| `activity.ts` | Page view tracking |
| `mock-user.ts` | Deprecated (backwards compat) |
| `index.ts` | Public API exports |

### RBAC Levels

| Role | Level | Capabilities |
|------|-------|--------------|
| admin | 10 | Full CRUD on everything |
| editor | 5 | Create, Read, Update any (no delete) |
| contributor | 3 | CRUD on own content only |
| viewer | 1 | Read public content only |

### Data Flow

1. **Login** → `userStore.validateCredentials()` → copies to `authStore`
2. **Profile Edit** → `userStore.updateUserProfile()` → auto-syncs to `authStore`
3. **UI Display** → subscribes to `userStore` → auto-updates on changes
4. **Page Reload** → `restoreAuthSubscription()` → re-syncs data

### Client-Side Protection

Use `OwnerGuard.astro` Web Component:

```astro
<OwnerGuard ownerId={userId} visibility="private">
  <button slot="controls">Edit</button>
  <div>Protected content</div>
</OwnerGuard>
```

Note: This is UI-level protection only. For true security, a backend would be required.

## Security

- CSP headers in `public/_headers`
- No server-side code (static site)
- Mock auth with localStorage (demo/personal use only)
- URL sanitization in CTA component
- Password-protected site gate (sessionStorage)

## External Dependencies

### Cloudflare Access

Protects `/admin/` routes in production.

| Policy | Path |
|--------|------|
| Production | `howtowincapitalism.com/admin/*` |
| Previews | `*.howtowincapitalism.pages.dev/admin/*` |
