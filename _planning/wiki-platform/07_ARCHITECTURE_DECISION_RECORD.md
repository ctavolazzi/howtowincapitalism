# Architecture Decision Record (ADR)

**Project:** Wiki Platform for howtowincapitalism
**Date:** 2025-12-14
**Status:** Approved

---

## ADR-001: Build vs Fork

**Context:** Need to decide whether to build wiki features from scratch, fork an existing wiki, or start fresh.

**Decision:** Build from scratch by extending the current howtowincapitalism project.

**Consequences:**
- (+) Maximum learning opportunity
- (+) Leverages existing auth/permissions/UI
- (+) Full customization control
- (-) Longer timeline than forking
- (-) More maintenance responsibility

**Alternatives Rejected:**
- Fork Wiki.js: Less learning, stack mismatch
- Fork MediaWiki: PHP, too complex
- Start fresh: Loses existing work

---

## ADR-002: Database Selection

**Context:** Need persistent storage for pages, revisions, users, and discussions.

**Decision:** Use Cloudflare D1 as the primary database.

**Consequences:**
- (+) Native to existing Cloudflare infrastructure
- (+) SQLite syntax (simple, familiar)
- (+) No external dependencies
- (+) Generous free tier
- (-) 10GB limit per database
- (-) Still in open beta

**Alternatives Rejected:**
- Supabase: External service, adds latency
- PlanetScale: Different vendor, MySQL syntax
- Turso: Another vendor to manage

---

## ADR-003: Content Storage Model

**Context:** Decide how to store wiki page content.

**Decision:** Store content in D1 database with full revision history.

**Schema Design:**
```sql
pages (id, path, title, content, author_id, created_at, updated_at)
page_revisions (id, page_id, revision_number, content, author_id, created_at)
```

**Consequences:**
- (+) Dynamic content, user-editable
- (+) Full revision history queryable
- (+) Simpler than file-based system
- (-) Moves away from static MDX
- (-) Search requires separate solution

**Alternatives Rejected:**
- Keep MDX files: Not user-editable
- Git-based storage: Complex for web editing
- Hybrid (files + DB): Sync complexity

---

## ADR-004: Authentication Migration

**Context:** Auth currently uses Cloudflare KV. Content will use D1.

**Decision:** Migrate authentication from KV to D1.

**Consequences:**
- (+) Single database for all data
- (+) Can join users with content
- (+) Simpler backup/restore
- (-) Migration effort required
- (-) KV is simpler for sessions

**Migration Strategy:**
1. Add D1 auth tables
2. Run both systems in parallel
3. Migrate users
4. Switch over
5. Remove KV auth code

---

## ADR-005: Editor Implementation

**Context:** Need a way for users to edit page content.

**Decision:** Start with simple textarea + Markdown preview, upgrade to CodeMirror.

**Phases:**
1. Textarea + Marked.js (MVP)
2. CodeMirror 6 (syntax highlighting)
3. TipTap WYSIWYG (if users request)

**Consequences:**
- (+) Simple initial implementation
- (+) Progressive enhancement
- (+) Markdown is familiar to developers
- (-) Non-technical users may struggle
- (-) No real-time collaboration

**Alternatives Rejected:**
- WYSIWYG from start: More complex, users are technical
- Monaco: Overkill for wiki editing
- No preview: Bad UX

---

## ADR-006: Search Strategy

**Context:** Users need to find content.

**Decision:** Start with Pagefind, upgrade to Meilisearch at scale.

**Phases:**
1. Pagefind (static, client-side)
2. Meilisearch (when >1000 pages)

**Consequences:**
- (+) Zero infrastructure initially
- (+) Fast, works offline
- (-) No real-time indexing
- (-) Requires rebuild on content change

**Alternatives Rejected:**
- Algolia: Expensive
- Elasticsearch: Too complex
- D1 LIKE queries: Too slow

---

## ADR-007: API Design

**Context:** Need APIs for page operations.

**Decision:** REST API following existing patterns.

**Endpoints:**
```
POST   /api/pages/           - Create page
GET    /api/pages/:id        - Get page
PUT    /api/pages/:id        - Update page
DELETE /api/pages/:id        - Delete page
GET    /api/pages/:id/history - Get revisions
POST   /api/pages/:id/revert  - Revert to revision
```

**Consequences:**
- (+) Consistent with existing APIs
- (+) Simple to implement
- (+) Easy to test
- (-) Multiple requests for complex data

**Alternatives Rejected:**
- GraphQL: Adds complexity without clear benefit

---

## ADR-008: Revision Storage

**Context:** Need to track every edit for history/revert.

**Decision:** Store full content snapshots per revision.

**Consequences:**
- (+) Simple to implement
- (+) Easy to restore any version
- (+) Fast to render history
- (-) Uses more storage
- (-) Redundant data

**Alternatives Rejected:**
- Store diffs only: Complex to reconstruct
- Hybrid (diff + periodic snapshots): More complex

---

## ADR-009: Discussion System

**Context:** Users need to discuss page content.

**Decision:** Implement talk pages (per-page discussion threads).

**Schema:**
```sql
talk_threads (id, page_id, title, author_id, created_at)
talk_messages (id, thread_id, author_id, content, created_at)
```

**Consequences:**
- (+) Wikipedia-familiar pattern
- (+) Discussions tied to content
- (+) Simple threading model
- (-) Not a full forum
- (-) May need notification system

**Alternatives Rejected:**
- Global forum: Disconnected from content
- Comments (flat): No threading
- External system (Disqus): Privacy, dependency

---

## ADR-010: Permissions Model

**Context:** Need to control who can do what.

**Decision:** Keep existing RBAC, extend for wiki operations.

**Role Capabilities:**
| Operation | Admin | Editor | Contributor | Viewer |
|-----------|-------|--------|-------------|--------|
| Create page | ✅ | ✅ | ✅ | ❌ |
| Edit any page | ✅ | ✅ | ❌ | ❌ |
| Edit own page | ✅ | ✅ | ✅ | ❌ |
| Delete page | ✅ | ❌ | ❌ | ❌ |
| Protect page | ✅ | ❌ | ❌ | ❌ |
| View history | ✅ | ✅ | ✅ | ✅ |
| Revert edits | ✅ | ✅ | ❌ | ❌ |

**Consequences:**
- (+) Existing system works
- (+) Well-documented
- (+) Easy to extend
- (-) May need page-level overrides later

---

## ADR-011: Deployment Strategy

**Context:** How to deploy changes.

**Decision:** Continue using Cloudflare Pages with GitHub integration.

**Workflow:**
```
git push → GitHub Actions → Build → Deploy to Pages
```

**Consequences:**
- (+) Existing infrastructure
- (+) Automatic deploys
- (+) Preview deployments
- (-) Build required for Pagefind index

---

## Summary of Decisions

| # | Decision | Confidence |
|---|----------|------------|
| 001 | Build from scratch | High |
| 002 | Cloudflare D1 | High |
| 003 | Content in D1 | High |
| 004 | Migrate auth to D1 | High |
| 005 | Markdown editor | Medium |
| 006 | Pagefind → Meilisearch | High |
| 007 | REST API | High |
| 008 | Full revision snapshots | Medium |
| 009 | Talk pages | Medium |
| 010 | Extend RBAC | High |
| 011 | Cloudflare Pages | High |

---

## Revision History

| Date | Change | Author |
|------|--------|--------|
| 2025-12-14 | Initial ADR created | Investigation |
