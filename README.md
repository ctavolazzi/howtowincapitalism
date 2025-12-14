# How To Win Capitalism

A satirical but practical wiki about financial autonomy. Notes on a system for people tired of the grind.

**Live:** [howtowincapitalism.com](https://howtowincapitalism.com)

## Quick Start

```bash
npm install       # Install dependencies
npm run dev       # Start dev server (localhost:4321)
npm run ship "message"  # Build + commit + push + deploy
```

## Site Navigation

| Section | Purpose |
|---------|---------|
| **FAQ** | Core concepts, answers to common questions |
| **Notes** | Research, analysis, observations |
| **Tools** | Templates, checklists, decision aids |

## Project Structure

```
howtowincapitalism/
├── _docs/                # Development documentation
│   ├── devlog/           # Daily development logs
│   ├── ARCHITECTURE.md   # Technical architecture
│   └── PROJECT_POLICIES.md # Standards & conventions
├── _work_efforts/        # Task tracking (Johnny Decimal)
├── .cursor/rules/        # AI assistant rules
├── src/
│   ├── content/docs/     # Wiki content (.mdx)
│   │   ├── faq/          # Core concepts
│   │   ├── notes/        # Research & observations
│   │   └── tools/        # Templates & calculators
│   ├── components/       # Astro components (atomic design)
│   │   ├── atoms/        # Basic elements
│   │   ├── molecules/    # Composite components
│   │   └── organisms/    # Complex sections
│   ├── lib/tools/        # TypeScript utilities
│   │   ├── decision-matrix.ts  # Quantitative decision tool
│   │   └── logger.mjs    # Development logger
│   ├── pages/            # Route pages
│   └── styles/           # CSS overrides
├── scripts/              # Build automation
├── AGENTS.md             # AI assistant instructions
└── DEVELOPERS.md         # Developer guide
```

## Adding Content

### Create a Page

```bash
# FAQ (concepts):     src/content/docs/faq/
# Notes (research):   src/content/docs/notes/
# Tools (templates):  src/content/docs/tools/

touch src/content/docs/faq/my-topic.mdx
```

### Page Template

```mdx
---
title: My Topic
description: Brief description for SEO
---

import Breadcrumbs from '../../../components/atoms/Breadcrumbs.astro';

<Breadcrumbs />

## My Topic

Your content here. Just write markdown.
```

### Ship It

```bash
npm run ship "added my-topic article"
```

Build → Commit → Push → Deploy. Live in ~30 seconds.

## Development

### Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start dev server |
| `npm run build` | Build site |
| `npm run ship "msg"` | **Build + Commit + Push + Deploy** |
| `npm run check` | Build + validate |
| `npm test` | Run E2E tests (Playwright) |
| `npm run test:ui` | Open Playwright test UI |
| `npm run test:unit` | Run unit tests (Vitest) |
| `npm run terminal:ambient` | Play a neon ambient animation (press any key to stop) |

### Testing

The project uses **Playwright** for end-to-end testing:

```bash
npm test              # Run all tests
npm run test:ui       # Open interactive test UI
npm run test:report   # View HTML test report
```

**Test coverage:**
- ✅ Login flow (all 4 user roles)
- ✅ Session persistence
- ✅ Protected route redirects
- ✅ Logout functionality
- ✅ Auth API endpoints

See `tests/auth.spec.ts` for the full test suite.

### Tools

The `src/lib/tools/` folder contains reusable utilities:

| Tool | Purpose |
|------|---------|
| `decision-matrix.ts` | Quantitative decision-making tool |
| `logger.mjs` | Development logging utility |

### Documentation

#### Technical Documentation (in `_docs/technical/`)

| Document | Purpose |
|----------|---------|
| `INDEX.md` | Master documentation index |
| `ARCHITECTURE.md` | System architecture, patterns, data flow |
| `AUTHENTICATION.md` | Auth flows, password security, RBAC |
| `API_REFERENCE.md` | All API endpoints with request/response formats |
| `COMPONENTS.md` | Component library documentation |
| `DATA_MODELS.md` | KV storage schema, TypeScript interfaces |
| `SECURITY.md` | Security measures, threat model |
| `TESTING.md` | E2E and unit testing guide |
| `DEPLOYMENT.md` | Cloudflare deployment, operations |

#### Developer Resources

| Document | Purpose |
|----------|---------|
| `AGENTS.md` | AI assistant instructions |
| `DEVELOPERS.md` | Developer guide |
| `_docs/PROJECT_POLICIES.md` | Standards & conventions |
| `_docs/devlog/` | Daily development logs |
| `_docs/documentation-checklist.md` | Generated documentation task list |

#### Code Documentation Standards

All source files should have `@fileoverview` JSDoc headers:

```typescript
/**
 * @fileoverview Module description
 *
 * Detailed explanation of what this module does.
 *
 * @module path/to/module
 * @see {@link module:related/module} - Description
 *
 * @author How To Win Capitalism Team
 * @since 1.0.0
 */
```

Run `node scripts/analyze-codebase.mjs` to check documentation coverage.

### Work Efforts

Tasks are tracked in `_work_efforts/` using the Johnny Decimal system:

```
_work_efforts/
├── 00-09_meta/           # Organization
├── 10-19_development/    # Dev tasks
├── 20-29_features/       # Features
└── 30-39_infrastructure/ # DevOps
```

### Cursor Rules

AI assistants follow rules in `.cursor/rules/`:

| Rule | Enforces |
|------|----------|
| `project-structure.mdc` | Directory organization |
| `work-efforts.mdc` | Johnny Decimal system |
| `documentation.mdc` | Documentation standards |
| `file-naming.mdc` | Naming conventions |

## Authentication

The site requires login to access content. Uses **Cloudflare KV** for storage and **httpOnly cookies** for sessions.

### Test Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@email.com | test_admin1 | admin |
| editor@email.com | test_editor1 | editor |
| contributor@email.com | test_contrib1 | contributor |
| viewer@email.com | test_viewer1 | viewer |

### How It Works

- Credentials stored in Cloudflare KV (hashed)
- Sessions stored in KV with 7-day TTL
- httpOnly cookies (XSS-resistant)
- Server-side validation via API routes
- All routes except `/login/` and `/disclaimer/` require auth

See `_docs/AUTH.md` for full technical documentation.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Astro](https://astro.build) v5 (SSR) |
| Auth | Cloudflare KV + httpOnly cookies |
| Content | MDX |
| Styling | CSS (Wikipedia-inspired) |
| Hosting | [Cloudflare Pages](https://pages.cloudflare.com) |
| Repo | [GitHub](https://github.com/ctavolazzi/howtowincapitalism) |

## Deployment

### One Command (Recommended)

```bash
npm run ship "your commit message"
```

This runs: **Build → Commit → Push → Deploy**

- ✓ Validates build before committing
- ✓ Stops immediately if any step fails
- ✓ Pushes to GitHub first (backup)
- ✓ Then deploys to Cloudflare

### Manual Steps

```bash
npm run build     # 1. Build
git add -A        # 2. Stage
git commit -m ""  # 3. Commit
git push          # 4. Push
npm run deploy    # 5. Deploy
```

## License

MIT
