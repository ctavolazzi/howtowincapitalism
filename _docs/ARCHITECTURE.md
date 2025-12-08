# Architecture

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Astro v5 |
| Theme | Starlight (docs theme) |
| Styling | Custom CSS (Wikipedia aesthetic) |
| Hosting | Cloudflare Pages |
| Search | Pagefind (client-side) |

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
│   │   ├── index.mdx         # Home page
│   │   ├── protocol/         # Wiki definitions
│   │   ├── field-notes/      # Blog/updates
│   │   └── reports/          # Downloadable reports
│   ├── lib/                  # Shared utilities
│   │   ├── constants.ts      # App constants
│   │   └── tools/            # Reusable utilities
│   │       ├── index.ts      # Tool exports
│   │       ├── decision-matrix.ts  # Decision matrix (924 lines)
│   │       └── README.md     # Tool documentation
│   └── styles/
│       └── custom.css        # All custom styling
├── astro.config.mjs          # Astro + Starlight config
├── package.json              # Dependencies and scripts
└── wrangler.toml             # Cloudflare config
```

## Component Architecture

### Design Pattern: Atomic Design

```
Atoms → Molecules → Organisms → Pages
```

**Atoms** (src/components/atoms/)
- `WikiBox.astro` - Base container component with variants

**Molecules** (src/components/molecules/)
- `Disclaimer.astro` - Warning banner (closable)
- `DecisionMatrix.astro` - Decision matrix renderer (uses tools/decision-matrix.ts)
- `InfoBox.astro` - Information callout
- `NoteBox.astro` - Note callout
- `NavBox.astro` - Navigation box
- `CallToAction.astro` - CTA with button

**Organisms** (src/components/organisms/)
- `PageHeader.astro` - Page header with title
- `ContentSection.astro` - Content wrapper

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

### Starlight Integration

Starlight provides:
- Header with search
- Sidebar navigation
- Mobile menu (hamburger)
- Pagination (disabled)
- TOC (disabled)

We override via:
- `customCss` in astro.config.mjs
- Component overrides (ThemeSelect → Empty.astro)
- CSS custom properties remapping Starlight's `--sl-*` vars

## Box Model / Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ <div class="page">                                      │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ <header>                                            │ │
│ │   [Title]                         [Search] [Menu]   │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌──────────┐ ┌────────────────────────────────────────┐ │
│ │ <nav>    │ │ <main>                                 │ │
│ │ Sidebar  │ │ Content                                │ │
│ │ (hidden  │ │                                        │ │
│ │  mobile) │ │                                        │ │
│ └──────────┘ └────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Key issue:** Search is in `<header>`, Menu button is in `<nav>` - different parents.

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

### Starlight Variable Remapping

We remap Starlight's variables to our palette:
```css
:root {
  --sl-color-white: var(--color-bg);
  --sl-color-black: var(--color-text);
  --sl-color-accent: var(--color-link);
  /* etc. */
}
```

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

## Security

- CSP headers in `public/_headers`
- No server-side code (static site)
- No user auth (yet)
- URL sanitization in CTA component

