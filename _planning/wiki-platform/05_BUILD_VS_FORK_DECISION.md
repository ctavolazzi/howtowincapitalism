# Build vs Fork Decision

**Date:** 2025-12-14
**Status:** Complete

## The Options

### Option A: Build from Scratch (Extend Current Project)

Extend the existing howtowincapitalism codebase to add wiki functionality.

### Option B: Fork Wiki.js

Fork and customize Wiki.js as the foundation.

### Option C: Fork MediaWiki

Fork and customize MediaWiki (what Wikipedia uses).

### Option D: Start Fresh with New Stack

Build a new project with optimal technology choices.

---

## Decision Matrix

| Factor | Weight | Build (A) | Wiki.js (B) | MediaWiki (C) | Fresh (D) |
|--------|--------|-----------|-------------|---------------|-----------|
| **Learning Value** | 25% | 10 | 5 | 3 | 10 |
| **Time to MVP** | 20% | 5 | 8 | 7 | 4 |
| **Customization** | 20% | 10 | 7 | 4 | 10 |
| **Stack Fit** | 15% | 9 | 6 | 2 | 8 |
| **Existing Work** | 10% | 10 | 0 | 0 | 0 |
| **Maintenance** | 10% | 7 | 5 | 3 | 7 |

**Weighted Scores:**
- **Build (A): 8.3** ← Highest
- Wiki.js (B): 5.9
- MediaWiki (C): 4.0
- Fresh (D): 7.2

---

## Detailed Analysis

### Option A: Build from Scratch

**Pros:**
1. **Maximum learning** - Understand every component deeply
2. **Full customization** - No constraints from existing architecture
3. **Leverages existing work** - Auth, permissions, UI already done
4. **Stack alignment** - Stays with TypeScript/Astro/Cloudflare
5. **Ownership** - Complete control over direction

**Cons:**
1. **Longer timeline** - Everything built manually
2. **Reinventing wheels** - Some features exist elsewhere
3. **Maintenance burden** - All bugs are your bugs

**Best for:** Learning, unique requirements, long-term ownership

---

### Option B: Fork Wiki.js

**Pros:**
1. **Faster start** - Core wiki features already built
2. **Modern stack** - Node.js, Vue.js, GraphQL
3. **Active community** - Updates and fixes
4. **Good documentation** - Easy to understand

**Cons:**
1. **Less learning** - Using someone else's architecture
2. **Merge conflicts** - Customizations conflict with upstream
3. **Stack mismatch** - Vue.js vs your Astro expertise
4. **Missing features** - No talk pages, limited community

**Best for:** Getting to market quickly, standard wiki needs

---

### Option C: Fork MediaWiki

**Pros:**
1. **Battle-tested** - Powers Wikipedia
2. **Feature complete** - Everything exists
3. **Massive community** - Extensive documentation
4. **Extensions** - 500+ available

**Cons:**
1. **PHP** - Different language, different ecosystem
2. **Complex** - 20+ years of code
3. **Hard to customize** - Not designed for major changes
4. **Hosting requirements** - Needs LAMP stack

**Best for:** Need Wikipedia-exact features, have PHP expertise

---

### Option D: Start Fresh

**Pros:**
1. **Clean architecture** - No legacy decisions
2. **Optimal choices** - Pick best tech for wiki
3. **Maximum learning** - Build everything

**Cons:**
1. **Loses existing work** - Auth/permissions rebuild
2. **Longest timeline** - Start from zero
3. **Risk of over-engineering** - Tendency to plan too much

**Best for:** Radically different requirements, unhappy with current stack

---

## Recommendation

### Primary: Option A (Build from Scratch / Extend Current)

**Rationale:**

1. **Learning is the goal** - You explicitly want to understand and implement wiki features yourself. Forking gives features but not understanding.

2. **Solid foundation exists** - The current project has:
   - Working authentication (both local and KV)
   - Complete RBAC permissions
   - Good component library
   - Wikipedia-inspired styling

3. **Stack is appropriate** - Astro with Cloudflare is viable for a wiki:
   - SSR for dynamic content
   - D1 for database
   - Pages for hosting
   - Workers for API

4. **Incremental progress** - Can add features one at a time while keeping site functional

5. **Full ownership** - No dependency on upstream project decisions

### Fallback: Option B (Fork Wiki.js) if...

Consider switching to Wiki.js if:
- Time pressure becomes critical
- Realization that certain features are too complex
- Need real-time collaboration (Wiki.js has it partially)
- User requirements exceed what's feasible to build

---

## What This Decision Means

### Technology Implications

| Aspect | Decision |
|--------|----------|
| Framework | Stay with Astro |
| Database | Add Cloudflare D1 |
| Auth | Migrate KV to D1, keep logic |
| Frontend | Astro + vanilla JS (no Vue/React) |
| Editor | Build custom (Markdown + preview) |
| Search | Start with simple, add Pagefind |
| API | REST (keep existing patterns) |

### Timeline Implications

- **Tier 0 (Foundation):** 4-6 weeks
- **Tier 1 (MVP Wiki):** 4-6 weeks additional
- **Total to MVP:** 8-12 weeks

### Risk Mitigation

1. **Timebox features** - If a feature takes too long, simplify
2. **Ship early** - Deploy after Tier 0, iterate publicly
3. **Have exit plan** - Keep Wiki.js fork as backup option
4. **Document decisions** - Make it easier to pivot if needed

---

## Action Items

1. ✅ Decision made: Build from scratch (extend current)
2. Next: Document technology stack decisions
3. Next: Write architecture decision record
4. Next: Define first milestone

---

## Dissenting Opinions

### Why Wiki.js might be better

> "Forking Wiki.js would get you to a functional wiki in weeks instead of months. You could then customize to learn specific parts rather than building everything from scratch."

**Counter:** The goal is understanding, not just having a wiki. Building teaches more than customizing.

### Why Fresh Start might be better

> "Astro is designed for content sites, not dynamic applications. Next.js or SvelteKit might be more appropriate for a wiki with heavy user interaction."

**Counter:** Astro's SSR mode handles dynamic content well. The existing codebase proves this. Switching frameworks loses proven work.

---

## Final Decision

**BUILD FROM SCRATCH (Extend Current Project)**

Confidence: High (8/10)

This aligns with:
- Stated goal of learning
- Existing work investment
- Technology preferences
- Long-term ownership goals
