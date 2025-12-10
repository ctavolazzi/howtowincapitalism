# How To Win Capitalism

A satirical but practical wiki about financial autonomy.

**Live:** [howtowincapitalism.com](https://howtowincapitalism.com)

## Navigation

| Section | Purpose |
|---------|---------|
| **FAQ** | Core concepts, answers to common questions |
| **Notes** | Research, analysis, observations |
| **Tools** | Templates, checklists, calculators |

## Quick Start

```bash
npm install       # Install dependencies
npm run dev       # Start dev server (localhost:4321)
npm run build     # Build for production
npm run ship      # Build + commit + push + deploy (one command!)
```

## Adding Content

The workflow is simple:

1. **Write** a `.mdx` file in `src/content/docs/`
2. **Ship** with `npm run ship "your message"`
3. **Done** — live in ~30 seconds

### Creating Pages

```bash
# Create in the right folder:
# - FAQ (concepts):     src/content/docs/faq/
# - Notes (research):   src/content/docs/notes/
# - Tools (templates):  src/content/docs/tools/

# Example: new FAQ article
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

## Project Structure

```
src/
├── content/docs/       # Content pages (.mdx)
│   ├── faq/            # Core concepts
│   ├── notes/          # Research & observations
│   └── tools/          # Templates & calculators
├── components/         # Astro components
├── layouts/
│   └── Base.astro      # Main layout + global CSS
├── pages/
│   ├── index.astro     # Homepage
│   └── [...slug].astro # Dynamic content routes
└── lib/
    └── tools/          # Reusable utilities
```

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start dev server |
| `npm run build` | Build site |
| `npm run preview` | Preview built site |
| `npm run ship` | **Build + Commit + Push + Deploy** |
| `npm run deploy` | Deploy to Cloudflare only |
| `npm run check` | Build + validate |

## Tech Stack

- **Framework:** [Astro](https://astro.build) v5
- **Styling:** Global CSS in `Base.astro`
- **Hosting:** [Cloudflare Pages](https://pages.cloudflare.com)
- **Repo:** [GitHub](https://github.com/ctavolazzi/howtowincapitalism)

## Why This Setup?

**Current workflow:**
1. Write markdown (`.mdx`)
2. Run `npm run ship`
3. Live in 30 seconds

**Alternatives considered:**

| Option | Ease | Trade-off |
|--------|------|-----------|
| This setup | Write markdown, ship | Need terminal |
| Tina CMS | Edit in browser | More complexity |
| Obsidian Publish | Write in app | $8/mo, less control |
| Ghost | Full platform | $9+/mo, hosted |

The current setup is **free**, **fast**, and **you own everything**.

## License

MIT
