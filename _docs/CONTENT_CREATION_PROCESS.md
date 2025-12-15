# Content Creation Process

**Version:** 1.0
**Created:** 2025-12-09
**Last Updated:** 2025-12-09

---

## Overview

This document defines the repeatable process for creating new wiki content pages. It ensures consistency, quality, and proper integration with the site's component library.

---

## Pre-Work Checklist

- [ ] Check current date/time
- [ ] Review active work effort (if exists)
- [ ] Identify which pages to create
- [ ] Verify existing pages for patterns to follow

---

## Phase 1: Planning

### 1.1 Define Content Scope

| Question | Answer |
|----------|--------|
| What topic? | ___ |
| What's the one-line description? | ___ |
| Who is this for? | ___ |
| What should reader know after reading? | ___ |
| Related existing pages? | ___ |

### 1.2 Outline Structure

Standard page structure:
1. **Frontmatter** — title, description, sidebar order, keywords
2. **Imports** — Breadcrumbs, Disclaimer, SeeAlso, Collapsible (as needed)
3. **Breadcrumbs** — Navigation hierarchy
4. **Disclaimer** — Legal warning
5. **Main content** — H2 sections with practical information
6. **Collapsibles** — For examples, objections, details
7. **SeeAlso** — Cross-links to related content

---

## Phase 2: Content Creation

### 2.1 Page Template

```mdx
---
title: Topic Name
description: One-line practical description
sidebar:
  order: X
head:
  - tag: meta
    attrs:
      name: keywords
      content: keyword1, keyword2, keyword3
---

import Breadcrumbs from '../../../components/atoms/Breadcrumbs.astro';
import Disclaimer from '../../../components/molecules/Disclaimer.astro';
import SeeAlso from '../../../components/molecules/SeeAlso.astro';
import Collapsible from '../../../components/atoms/Collapsible.astro';

<Breadcrumbs />

<Disclaimer />

## What is [Topic]?

**[Topic]** is [definition]. [Why it matters in one sentence].

## Why It Matters

[Practical impact on reader's life]

## How It Works

[Core mechanics/concepts]

## Practical Applications

[Actionable steps]

## Common Mistakes

<Collapsible title="Mistake 1" variant="warning">
[Explanation and correction]
</Collapsible>

## The Bottom Line

[Topic] is:
- **Point 1** — summary
- **Point 2** — summary
- **Point 3** — summary

---

<SeeAlso links={[
  { title: "Related Page 1", href: "/path/", description: "Why related" },
  { title: "Related Page 2", href: "/path/", description: "Why related" }
]} />
```

### 2.2 Content Guidelines

| Guideline | Example |
|-----------|---------|
| **Wikipedia aesthetic** | Factual, neutral, cite concepts |
| **Satirical tone** | "the game may be rigged - learn how to win better" |
| **Practical focus** | Actionable > theoretical |
| **Use components** | Collapsible for examples, FAQ for questions |
| **Real numbers** | $10,000 at 7% for 30 years = $81,165 |
| **Tables for comparison** | Side-by-side options |

### 2.3 Sidebar Order Convention

| Order | Page Type |
|-------|-----------|
| 1 | Introduction |
| 2-9 | Core concepts (foundational) |
| 10-19 | Intermediate concepts |
| 20-29 | Advanced/tools |
| 99 | Decision Matrix (always last in Protocol) |

---

## Phase 3: Integration

### 3.1 Update CompletenessMeter

File: `src/components/molecules/CompletenessMeter.astro`

Add new page to `trackablePages` array:
```javascript
{ path: '/protocol/new-page/', label: 'New Page', icon: '📄' },
```

### 3.2 Update Homepage

File: `src/content/docs/index.mdx`

Add new TopicCard:
```astro
<TopicCard
  title="New Page"
  description="One-line description"
  href="/protocol/new-page/"
  icon="📄"
  tag="New"
/>
```

### 3.3 Update Related Pages

Update `SeeAlso` links on related pages to include the new content.

### 3.4 Verify Build

```bash
npm run build
```

Expected output:
- No errors
- New page appears in route list
- Words indexed increases

---

## Phase 4: Documentation

### 4.1 Update Devlog

File: `_docs/devlog/YYYY/MM/DD.md`

Add session entry with:
- Pages created
- Lines of content
- Key topics covered
- Build stats

### 4.2 Update Work Effort

File: `_work_efforts/10-19_development/10_active/10.04_content_expansion.md`

Update:
- Task checkboxes
- Progress log
- Content inventory stats

---

## Phase 5: Deploy

### 5.1 Commit

```bash
git add -A
git commit -m "feat: add [page-name] Protocol page

- [Key content point 1]
- [Key content point 2]
- Updated CompletenessMeter, homepage, related pages
"
```

### 5.2 Push & Deploy

```bash
git push origin main
npx wrangler pages deploy dist --project-name howtowincapitalism
```

---

## Post-Work Checklist

- [ ] New page builds without errors
- [ ] CompletenessMeter tracks new page
- [ ] Homepage shows new TopicCard
- [ ] Related pages link to new content
- [ ] Devlog updated
- [ ] Work effort updated
- [ ] Committed with descriptive message
- [ ] Pushed to GitHub
- [ ] Deployed to Cloudflare

---

## Lessons Learned

### 2025-12-09 (Initial)

1. **Import errors** — Don't import components you're not using (WikiBox error)
2. **Decision Matrix format** — Use array format for scores, not nested objects
3. **Sidebar order** — Plan ahead to leave room for future pages
4. **Build verification** — Always run `npm run build` before committing

### 2025-12-09 (Session 6 - Process Refinement)

5. **Batch related pages** — Creating 2 pages at once is efficient; same integration step covers both
6. **Update SeeAlso on related pages** — New content should link TO and FROM existing pages
7. **Process document value** — Following a checklist prevents missed steps
8. **Metrics tracking** — Recording before/after stats (pages, words) shows progress
9. **Gitignored work efforts** — `_work_efforts/` is gitignored, so changes there don't appear in commits (that's fine, it's local tracking)
10. **Todo list parallelism** — Following the process doc phases maps directly to todo items

### 2025-12-09 (Session 7 - Phase 2 Content)

11. **MDX escaping** — `<` followed by numbers/letters (like `<5%`) is interpreted as JSX. Use "less than" or `&lt;` instead.

---

## Metrics to Track

| Metric | How to Check |
|--------|--------------|
| Pages indexed | Build output → "Indexed X pages" |
| Words indexed | Build output → "Indexed X words" |
| Build time | Build output → "X page(s) built in Xs" |
| Lines added | Git commit output |

---

## Quick Reference

### Component Import Paths (from protocol pages)

```javascript
import Breadcrumbs from '../../../components/atoms/Breadcrumbs.astro';
import Disclaimer from '../../../components/molecules/Disclaimer.astro';
import SeeAlso from '../../../components/molecules/SeeAlso.astro';
import Collapsible from '../../../components/atoms/Collapsible.astro';
import FAQ from '../../../components/molecules/FAQ.astro';
import DecisionMatrix from '../../../components/molecules/DecisionMatrix.astro';
import { makeDecision } from '../../../lib/tools';
```

### Icon Reference

| Icon | Meaning |
|------|---------|
| 📖 | Introduction/overview |
| 📈 | Growth/compound interest |
| 🛡️ | Protection/safety |
| 💰 | Money/accounts |
| 📊 | Analysis/matrix |
| ⚖️ | Comparison/balance |
| 🎯 | Decision/goal |
| 💳 | Debt/credit |
| 💼 | Income/career |

---

*This document is updated as the process evolves.*
