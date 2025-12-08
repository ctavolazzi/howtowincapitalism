# Development Log

## December 8, 2025

### Session 2: Added Decision Matrix Tool + Component

**Time:** 3:20 PM PST

Created `src/lib/tools/` folder with a Decision Matrix utility - a quantitative decision-making tool for comparing options against weighted criteria.

**Files Created:**
- `src/lib/tools/decision-matrix.ts` - Full implementation (~924 lines)
- `src/lib/tools/index.ts` - Central export
- `src/components/molecules/DecisionMatrix.astro` - Web renderer component

**Design Decisions:**
1. **`tools/` naming** - Consistency with cross-project conventions (vs `scripts/` for shell)
2. **Created Astro component** - The TS utility outputs CLI-style text; the component renders it in Wikipedia style for the wiki
3. **Integration pattern** - Use `makeDecision()` to generate data, `<DecisionMatrix>` to render it

**Features:**
- 4 analysis methods: weighted, normalized, ranking, best-worst scaling
- Automatic strength/weakness identification
- Confidence scoring and recommendation generation
- Comparison tables and detailed breakdowns
- Full TypeScript types

**Usage in MDX:**
```astro
---
import DecisionMatrix from '../../components/molecules/DecisionMatrix.astro';
import { makeDecision } from '../../lib/tools';

const result = makeDecision({
  options: ["401k", "Roth IRA", "Taxable"],
  criteria: ["Tax Benefit", "Flexibility", "Growth"],
  scores: { "401k": [9, 3, 7], "Roth IRA": [7, 6, 8], "Taxable": [2, 9, 7] },
  weights: [0.4, 0.3, 0.3]
});
---

<DecisionMatrix result={result} title="Investment Account Comparison" />
```

---

### Session 1: Initial Build

Built initial site with Astro + Starlight. Key decisions:

1. **Wikipedia aesthetic** - Black/white, serif headers, blue links, no border-radius
2. **Cloudflare Pages** - Manual deploy via `wrangler`, not auto-deploy on push
3. **No auth** - Static site only, CMS removed
4. **Modular components** - Atomic design (atoms → molecules → organisms)

### Issues Encountered

- Navigation hidden behind hamburger on mobile
- Search and hamburger in different DOM containers
- CSS fighting Starlight's defaults with too many `!important`
- Theme mismatch (dark init, light forced)

### Decisions Made

- Keep Starlight's header structure (don't replace)
- Use CSS to make nav visible, not component overrides
- Made disclaimer closable with localStorage persistence
- Created _docs folder for internal documentation

### TODO

- [ ] Fix visible navigation
- [ ] Clean up header spacing
- [ ] Refactor CSS to reduce `!important`
- [ ] Add proper current-page indicator

---

## Commands Reference

```bash
# Development
npm run dev          # Start dev server

# Content
npm run new protocol my-topic   # Create new page

# Deploy
npm run ship "message"          # Build → Commit → Push → Deploy

# Assets
npm run og-image     # Regenerate social image
npm run icons        # Regenerate PWA icons
```

