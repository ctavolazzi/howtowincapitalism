# Wiki Platform Investigation - Index

**Project:** howtowincapitalism → Wiki Platform
**Date:** 2025-12-14
**Status:** Investigation Complete

---

## Documents

| # | Document | Purpose | Status |
|---|----------|---------|--------|
| 01 | [Research: Existing Wikis](./01_RESEARCH_EXISTING_WIKIS.md) | MediaWiki & Wiki.js analysis | ✅ Complete |
| 02 | [Wiki.js Feature Exploration](./02_WIKIJS_FEATURE_EXPLORATION.md) | Deep dive into Wiki.js features | ✅ Complete |
| 03 | [Current Project Audit](./03_CURRENT_PROJECT_AUDIT.md) | What exists, what's missing | ✅ Complete |
| 04 | [Feature Tiers](./04_FEATURE_TIERS.md) | MVP definition and roadmap | ✅ Complete |
| 05 | [Build vs Fork Decision](./05_BUILD_VS_FORK_DECISION.md) | Decision with rationale | ✅ Complete |
| 06 | [Technology Stack](./06_TECHNOLOGY_STACK.md) | Tech choices and reasons | ✅ Complete |
| 07 | [Architecture Decision Record](./07_ARCHITECTURE_DECISION_RECORD.md) | All decisions documented | ✅ Complete |
| 08 | [First Milestone](./08_FIRST_MILESTONE.md) | M0 implementation plan | ✅ Complete |

---

## Key Decisions

| Decision | Choice | Confidence |
|----------|--------|------------|
| Approach | Build from scratch (extend current) | High |
| Database | Cloudflare D1 | High |
| Framework | Keep Astro | High |
| Editor | Markdown (CodeMirror later) | Medium |
| Search | Pagefind → Meilisearch | High |
| API | REST | High |

---

## Timeline

| Phase | Duration | Focus |
|-------|----------|-------|
| M0 (Foundation) | 4-6 weeks | Database + basic editing |
| M1 (MVP Wiki) | 4-6 weeks | History, diff, search |
| M2 (Community) | 4-6 weeks | Discussions, profiles |
| M3 (Scale) | 4-6 weeks | Moderation, performance |

---

## Next Steps

1. **Start M0 implementation**
   - Create D1 database
   - Apply schema
   - Build page API
   - Create editor UI

2. **Decision points during M0**
   - Editor complexity (textarea vs CodeMirror)
   - Auth migration timing
   - Search implementation

---

## Reading Order

For full understanding, read in this order:

1. **03_CURRENT_PROJECT_AUDIT.md** - What we have
2. **01_RESEARCH_EXISTING_WIKIS.md** - What others do
3. **04_FEATURE_TIERS.md** - What we want
4. **05_BUILD_VS_FORK_DECISION.md** - How we'll build
5. **06_TECHNOLOGY_STACK.md** - With what tools
6. **07_ARCHITECTURE_DECISION_RECORD.md** - Why each choice
7. **08_FIRST_MILESTONE.md** - What's first

---

## Quick Reference

**MVP Features (M0 + M1):**
- User-editable pages
- Revision history
- Diff viewer
- Wikilinks
- Search
- Recent changes

**Not MVP:**
- Talk pages
- Watchlists
- WYSIWYG editor
- Video content
- Mobile app

**Tech Stack:**
- Astro 5.x (framework)
- Cloudflare D1 (database)
- Cloudflare Pages (hosting)
- Marked + CodeMirror (editor)
- Pagefind (search)

---

*Investigation completed 2025-12-14*
