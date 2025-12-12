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
| `npm run dev` | Start dev server **with TinaCMS** |
| `npm run dev:astro` | Start Astro-only dev server (no CMS) |
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

| Document | Purpose |
|----------|---------|
| `AGENTS.md` | AI assistant instructions |
| `DEVELOPERS.md` | Developer guide |
| `_docs/ARCHITECTURE.md` | Technical architecture |
| `_docs/AUTH.md` | Authentication system |
| `_docs/PROJECT_POLICIES.md` | Standards & conventions |
| `_docs/devlog/` | Daily development logs |

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
| admin@email.com | Adm!n_Secure_2024# | admin |
| editor@email.com | Ed!tor_Access_2024# | editor |
| contributor@email.com | Contr!b_Pass_2024# | contributor |
| viewer@email.com | V!ewer_Read_2024# | viewer |

### How It Works

- Credentials stored in Cloudflare KV (hashed)
- Sessions stored in KV with 7-day TTL
- httpOnly cookies (XSS-resistant)
- Server-side validation via API routes
- All routes except `/login/` and `/disclaimer/` require auth

See `_docs/AUTH.md` for full technical documentation.

## Content Management (TinaCMS)

The `/admin/` route provides a visual editor for wiki content via TinaCMS.

### Local Development

```bash
npm run dev          # Starts Astro + TinaCMS admin
npm run dev:astro    # Starts Astro only (no CMS)
```

### Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `TINA_CLIENT_ID` | Tina Cloud client ID | Production |
| `TINA_TOKEN` | Tina Cloud token | Production |

See `DEVELOPERS.md` for setup instructions.

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
