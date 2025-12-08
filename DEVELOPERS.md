# Developer Guide

Comprehensive documentation for contributing to How To Win Capitalism.

## Table of Contents

- [Getting Started](#getting-started)
- [Architecture Overview](#architecture-overview)
- [Component System](#component-system)
- [Tools & Utilities](#tools--utilities)
- [Content Authoring](#content-authoring)
- [Styling Guide](#styling-guide)
- [Testing & Quality](#testing--quality)
- [Deployment](#deployment)
- [Conventions](#conventions)

---

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm 9+
- Git

### Installation

```bash
git clone https://github.com/ctavolazzi/howtowincapitalism.git
cd howtowincapitalism
npm install
```

### Development Server

```bash
npm run dev
# Open http://localhost:4321
```

### Available Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run check` | Validate build (CI check) |
| `npm run deploy` | Deploy to Cloudflare Pages |
| `npm run ship "msg"` | Build + Commit + Push + Deploy |
| `npm run new <section> <name>` | Create new content page |
| `npm run og-image` | Regenerate social image |
| `npm run icons` | Regenerate PWA icons |

---

## Architecture Overview

### Tech Stack

```
┌─────────────────────────────────────────────┐
│              Cloudflare Pages               │  ← Hosting + CDN
├─────────────────────────────────────────────┤
│                 Astro v5                    │  ← Framework
├─────────────────────────────────────────────┤
│               Starlight                     │  ← Docs theme
├─────────────────────────────────────────────┤
│  Custom CSS (Wikipedia) │ TypeScript Tools  │  ← Customization
└─────────────────────────────────────────────┘
```

### Directory Structure

```
howtowincapitalism/
├── _docs/                    # Internal documentation
│   ├── ARCHITECTURE.md       # System architecture
│   ├── DEVLOG.md             # Development history
│   └── devlog/YYYY/MM/DD.md  # Daily entries
├── public/                   # Static assets (copied to dist/)
├── scripts/                  # Build and utility scripts
├── src/
│   ├── components/           # Astro components
│   │   ├── atoms/            # Base building blocks
│   │   ├── molecules/        # Composed components
│   │   ├── organisms/        # Complex components
│   │   ├── utilities/        # Helper components
│   │   └── index.ts          # Export registry
│   ├── content/
│   │   ├── docs/             # MDX content pages
│   │   └── content.config.ts # Content schema
│   ├── lib/
│   │   ├── constants.ts      # App-wide constants
│   │   └── tools/            # Reusable utilities
│   └── styles/
│       └── custom.css        # All custom styles
├── .gitignore                # Git exclusions
├── astro.config.mjs          # Astro + Starlight config
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
└── wrangler.toml             # Cloudflare config
```

### Gitignored (Local Only)

```
_work_efforts/    # Johnny Decimal task tracking
.private/         # Admin scripts, security tools
_local/           # Personal notes
*.local.md        # Local drafts
```

---

## Component System

### Atomic Design Pattern

```
Atoms → Molecules → Organisms → Pages
```

| Level | Location | Examples |
|-------|----------|----------|
| **Atoms** | `components/atoms/` | WikiBox |
| **Molecules** | `components/molecules/` | Disclaimer, DecisionMatrix, InfoBox |
| **Organisms** | `components/organisms/` | PageHeader, ContentSection |
| **Utilities** | `components/utilities/` | Empty (slot replacement) |

### Creating Components

**1. Create the component file:**

```astro
---
// src/components/molecules/MyComponent.astro

/**
 * MYCOMPONENT - MOLECULE
 * 
 * Description of what this component does.
 */

export interface Props {
  title: string;
  variant?: 'default' | 'warning';
}

const { title, variant = 'default' } = Astro.props;
---

<div class={`my-component my-component--${variant}`}>
  <h3>{title}</h3>
  <slot />
</div>

<style>
  .my-component {
    /* Use design tokens */
    padding: var(--space-md);
    border: var(--border-width) solid var(--color-border);
  }
  
  .my-component--warning {
    background: var(--color-warning-bg);
  }
</style>
```

**2. Export from index:**

```typescript
// src/components/index.ts
export { default as MyComponent } from './molecules/MyComponent.astro';
```

**3. Use in content:**

```mdx
import MyComponent from '../../components/molecules/MyComponent.astro';

<MyComponent title="Hello" variant="warning">
  Content here
</MyComponent>
```

### WikiBox (Base Component)

All box-style components should extend WikiBox:

```astro
---
import WikiBox from '../atoms/WikiBox.astro';
---

<WikiBox variant="info" title="My Title">
  <slot />
</WikiBox>
```

**Variants:** `default`, `warning`, `info`, `sidebar`, `nav`, `cta`

---

## Tools & Utilities

### Location

```
src/lib/tools/
├── index.ts              # Central exports
├── decision-matrix.ts    # Decision matrix utility
└── README.md             # API documentation
```

### Decision Matrix

Quantitative decision-making tool.

**Basic Usage:**

```typescript
import { makeDecision } from '../lib/tools';

const result = makeDecision({
  options: ["Option A", "Option B", "Option C"],
  criteria: ["Cost", "Speed", "Quality"],
  scores: {
    "Option A": [7, 8, 6],
    "Option B": [9, 5, 7],
    "Option C": [6, 9, 8]
  },
  weights: [0.3, 0.2, 0.5]  // Must sum to 1.0
});

console.log(result.winner);           // Best option
console.log(result.confidenceScore);  // 0-100
console.log(result.recommendation);   // Human-readable advice
```

**With Astro Component:**

```astro
---
import DecisionMatrix from '../../components/molecules/DecisionMatrix.astro';
import { makeDecision } from '../../lib/tools';

const result = makeDecision({ /* config */ });
---

<DecisionMatrix result={result} title="Comparison" />
```

**Analysis Methods:**

- `weighted` (default) - Traditional weighted scoring
- `normalized` - Scores normalized to 0-100
- `ranking` - Convert to ranks per criterion
- `best_worst` - Scale relative to best/worst

See `src/lib/tools/README.md` for full API reference.

### Adding New Tools

1. Create `src/lib/tools/your-tool.ts`
2. Export from `src/lib/tools/index.ts`
3. Document in `src/lib/tools/README.md`
4. If web-renderable, create matching component in `components/molecules/`

---

## Content Authoring

### File Structure

```
src/content/docs/
├── index.mdx              # Home page
├── protocol/              # Wiki definitions
│   ├── introduction.mdx
│   └── decision-matrix.mdx
├── field-notes/           # Updates
│   └── latest.mdx
└── reports/               # Downloadable content
    └── index.mdx
```

### MDX Frontmatter

```mdx
---
title: Page Title
description: SEO description (optional)
tableOfContents: false     # Disable TOC (optional)
---
```

### Using Components in MDX

```mdx
---
title: My Page
---

import Disclaimer from '../../components/molecules/Disclaimer.astro';
import { makeDecision } from '../../lib/tools';

{/* Static imports */}
<Disclaimer />

{/* Dynamic data */}
export const myData = makeDecision({ /* ... */ });

{/* Use exported data */}
Winner: {myData.winner}
```

### Creating New Pages

```bash
# Using helper script
npm run new protocol my-topic
npm run new field-notes my-update

# Creates: src/content/docs/<section>/<name>.mdx
```

---

## Styling Guide

### Design Tokens

All values come from CSS custom properties in `src/styles/custom.css`:

```css
:root {
  /* Spacing (8px base) */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 16px;
  --space-xl: 24px;
  
  /* Colors (Wikipedia palette) */
  --color-bg: #ffffff;
  --color-text: #202122;
  --color-link: #0645ad;
  --color-border: #a2a9b1;
  --color-surface: #f8f9fa;
  
  /* Typography */
  --font-sans: system-ui, sans-serif;
  --font-serif: Georgia, serif;
  --font-mono: monospace;
}
```

### Rules

1. **Always use tokens** - Never hardcode colors, spacing, or fonts
2. **No border-radius** - Wikipedia aesthetic
3. **Minimal `!important`** - Only for Starlight overrides
4. **Mobile-first** - Default styles, then `@media` for desktop

### Component Scoped Styles

```astro
<style>
  /* Scoped to this component */
  .my-class {
    padding: var(--space-md);
    color: var(--color-text);
  }
</style>
```

---

## Testing & Quality

### Build Validation

```bash
npm run check    # Build + validate
npm run build    # Production build
```

### Linting

TypeScript errors surface during build. No separate lint command currently.

### Manual Testing

1. Run `npm run dev`
2. Check all pages render
3. Test components with different props
4. Verify mobile responsive behavior
5. Check search functionality

### Pre-Commit Checklist

- [ ] `npm run check` passes
- [ ] No TypeScript errors
- [ ] Components render correctly
- [ ] Mobile layout works
- [ ] No sensitive data committed

---

## Deployment

### One-Command Deploy

```bash
npm run ship "your commit message"
```

This runs:
1. `npm run build` - Verify build works
2. `git add -A && git commit` - Commit changes
3. `git push` - Push to GitHub
4. `wrangler pages deploy dist` - Deploy to Cloudflare

### Manual Deploy

```bash
npm run build
npm run deploy
```

### CI/CD

GitHub Actions validates builds on push. Deployment is manual (not auto-deploy).

### Environment

- **Production:** https://howtowincapitalism.com
- **Cloudflare Dashboard:** https://dash.cloudflare.com

---

## Conventions

### Git Commits

Use conventional commits:

```
feat: add new feature
fix: fix a bug
docs: documentation only
style: formatting, no code change
refactor: code change, no feature/fix
chore: maintenance tasks
```

Examples:
```
feat: add Decision Matrix tool
fix: correct destructuring bug in DecisionMatrix component
docs: update README with tools section
chore: update dependencies
```

### File Naming

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase.astro | `DecisionMatrix.astro` |
| TypeScript | kebab-case.ts | `decision-matrix.ts` |
| Content | kebab-case.mdx | `decision-matrix.mdx` |
| Styles | kebab-case.css | `custom.css` |

### Code Style

- **TypeScript:** Strict mode, explicit types for public APIs
- **Components:** Props interface, JSDoc comments
- **CSS:** Design tokens only, scoped styles

### Documentation

- Update README for user-facing changes
- Update DEVELOPERS.md for dev workflow changes
- Update _docs/DEVLOG.md for significant decisions
- Add daily entries to `_docs/devlog/YYYY/MM/DD.md` for session tracking

---

## Getting Help

- **Architecture questions:** See `_docs/ARCHITECTURE.md`
- **Development history:** See `_docs/DEVLOG.md`
- **Tool APIs:** See `src/lib/tools/README.md`
- **Starlight docs:** https://starlight.astro.build

---

## Contributing

1. Create a branch: `git checkout -b feat/my-feature`
2. Make changes
3. Test: `npm run check`
4. Commit: `git commit -m "feat: description"`
5. Push: `git push -u origin feat/my-feature`
6. Open PR

For significant changes, discuss in an issue first.
