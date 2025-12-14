# Technology Stack Decisions

**Date:** 2025-12-14
**Status:** Complete

## Stack Overview

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Framework** | Astro 5.x | Keep existing, SSR capable |
| **Runtime** | Cloudflare Workers | Edge performance, existing infra |
| **Database** | Cloudflare D1 | Native integration, SQLite syntax |
| **Auth** | Custom (migrate from KV) | Already built, just move to D1 |
| **Editor** | CodeMirror + Marked | Markdown with live preview |
| **Search** | Pagefind (start), Meilisearch (scale) | Progressive enhancement |
| **Styling** | Existing CSS | Wikipedia-inspired already done |
| **Hosting** | Cloudflare Pages | Current infrastructure |

---

## Detailed Decisions

### 1. Framework: Astro 5.x

**Decision:** Keep Astro

**Alternatives Considered:**
| Framework | Pros | Cons | Verdict |
|-----------|------|------|---------|
| **Astro** | Already using, SSR works, edge-ready | Not designed for apps | Keep ✅ |
| Next.js | React ecosystem, app router | Full rebuild needed | Skip |
| SvelteKit | Simple, fast, edge-ready | Full rebuild needed | Skip |
| Remix | Nested routes, data loading | Full rebuild needed | Skip |

**Rationale:**
- Project already works on Astro
- SSR mode handles dynamic content
- Cloudflare adapter is mature
- No compelling reason to switch

**Risks:**
- Astro is content-focused, not app-focused
- May hit limitations with complex interactions

**Mitigation:**
- Use Islands architecture for interactive components
- Add client-side framework (Preact) only where needed

---

### 2. Database: Cloudflare D1

**Decision:** Use D1 as primary database

**Alternatives Considered:**
| Database | Pros | Cons | Verdict |
|----------|------|------|---------|
| **D1** | Native to Cloudflare, SQLite, free tier | 10GB limit per DB, beta | Use ✅ |
| Supabase | PostgreSQL, more features, realtime | External service, latency | Skip |
| PlanetScale | MySQL, branching, scale | External, MySQL syntax | Skip |
| Turso | SQLite at edge, libSQL | Another vendor | Skip |

**Rationale:**
- Already on Cloudflare ecosystem
- No external dependencies
- SQLite is simple and sufficient
- Free tier is generous (5M reads/day)

**Schema Approach:**
- Start simple, add tables as needed
- Use migrations for changes
- Index carefully (affects D1 billing)

**Risks:**
- 10GB per database limit
- Still in "open beta" (though stable)
- No built-in replication

**Mitigation:**
- Keep content under 10GB (plenty for text wiki)
- Archive old revisions if needed
- D1 has Time Travel for recovery

---

### 3. Authentication: Migrate to D1

**Decision:** Move auth from KV to D1

**Current State:**
- Users stored in Cloudflare KV
- Sessions stored in Cloudflare KV
- Works, but separate from content

**New State:**
- Users in D1 `users` table
- Sessions in D1 `sessions` table
- Everything in one database

**Migration Plan:**
1. Create D1 schema with users/sessions tables
2. Add D1 auth functions alongside KV
3. Migrate existing users
4. Switch over
5. Deprecate KV auth

**Rationale:**
- Single database simplifies queries
- Can join users with content
- Easier backups and migrations
- Reduces number of services

---

### 4. Editor: CodeMirror + Marked

**Decision:** Custom Markdown editor with live preview

**Alternatives Considered:**
| Editor | Pros | Cons | Verdict |
|--------|------|------|---------|
| **CodeMirror 6** | Modern, extensible, syntax highlight | Some complexity | Use ✅ |
| Monaco (VS Code) | Full IDE, powerful | Heavy, overkill | Skip |
| Textarea + Marked | Simplest possible | No syntax highlighting | Start here |
| TipTap (WYSIWYG) | Rich text, modern | More complex, React-based | Maybe later |
| ProseMirror | Powerful, customizable | High learning curve | Skip |

**Implementation:**

**Phase 1 (MVP):** Simple textarea with preview
```html
<textarea id="editor"></textarea>
<div id="preview"></div>
<script>
  // Marked.js for parsing
  editor.oninput = () => {
    preview.innerHTML = marked.parse(editor.value);
  };
</script>
```

**Phase 2:** Add CodeMirror for syntax highlighting
```javascript
import { EditorView, basicSetup } from 'codemirror';
import { markdown } from '@codemirror/lang-markdown';

const editor = new EditorView({
  extensions: [basicSetup, markdown()],
  parent: document.getElementById('editor'),
});
```

**Rationale:**
- Start simple, add complexity as needed
- Markdown is familiar to target users
- CodeMirror is the standard for code editing
- Can add WYSIWYG later if users demand it

---

### 5. Search: Pagefind → Meilisearch

**Decision:** Start with Pagefind, upgrade to Meilisearch at scale

**Phase 1: Pagefind**
- Static search index built at deploy
- No server required
- Fast, lightweight
- Works on Cloudflare Pages

**Phase 2: Meilisearch**
- When: >1000 pages or need real-time indexing
- Why: Full-text search, typo tolerance, facets
- How: Self-hosted or Meilisearch Cloud

**Alternatives:**
| Search | Pros | Cons | Verdict |
|--------|------|------|---------|
| **Pagefind** | Simple, static, fast | No real-time | Start here ✅ |
| Algolia | Powerful, hosted | Expensive, external | Skip |
| **Meilisearch** | Fast, easy, self-host | Need to run server | Phase 2 ✅ |
| Elasticsearch | Industry standard | Complex, heavy | Overkill |
| D1 LIKE queries | Built-in | Slow, no ranking | Emergency only |

---

### 6. Styling: Keep Existing

**Decision:** Keep current CSS, extend as needed

**Current:**
- Wikipedia-inspired design
- CSS variables for theming
- Mobile responsive
- Component-scoped styles

**What to Add:**
- Editor component styles
- Diff viewer styles
- Talk page styles
- History page styles

**No Framework:**
- Not adding Tailwind (already have system)
- Not adding CSS-in-JS (not needed)
- Keep vanilla CSS with BEM-ish naming

---

### 7. API Pattern: REST

**Decision:** Keep REST API pattern

**Current APIs:**
- `/api/auth/*` - Authentication
- `/api/admin/*` - User management

**New APIs to Add:**
- `/api/pages/*` - Page CRUD
- `/api/revisions/*` - History
- `/api/search/*` - Search
- `/api/talk/*` - Discussions

**Why Not GraphQL:**
- REST is simpler for this use case
- Already have REST patterns established
- GraphQL adds complexity without clear benefit
- Can add GraphQL later if needed

---

## Full Stack Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Astro Pages │  │   Editor    │  │    Search (Pagefind)    │  │
│  │   (SSR)     │  │ (CodeMirror)│  │    (static index)       │  │
│  └──────┬──────┘  └──────┬──────┘  └────────────┬────────────┘  │
└─────────┼────────────────┼──────────────────────┼───────────────┘
          │                │                      │
          └────────────────┴──────────────────────┘
                           │
                    ┌──────┴──────┐
                    │  REST APIs  │
                    │  /api/*     │
                    └──────┬──────┘
                           │
┌──────────────────────────┼──────────────────────────────────────┐
│              CLOUDFLARE WORKERS                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │    Auth     │  │   Content   │  │        Search           │  │
│  │  Handlers   │  │  Handlers   │  │       Handlers          │  │
│  └──────┬──────┘  └──────┬──────┘  └────────────┬────────────┘  │
└─────────┼────────────────┼──────────────────────┼───────────────┘
          │                │                      │
          └────────────────┴──────────────────────┘
                           │
                    ┌──────┴──────┐
                    │ Cloudflare  │
                    │     D1      │
                    └─────────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
        ┌─────┴────┐ ┌─────┴────┐ ┌─────┴────┐
        │  users   │ │  pages   │ │revisions │
        │ sessions │ │categories│ │  talk    │
        └──────────┘ └──────────┘ └──────────┘
```

---

## Package Dependencies

### Production Dependencies (to add)

```json
{
  "dependencies": {
    "marked": "^12.0.0",          // Markdown parsing
    "@codemirror/lang-markdown": "^6.0.0",  // Editor (phase 2)
    "codemirror": "^6.0.0",       // Editor (phase 2)
    "diff": "^5.0.0"              // Diff generation
  }
}
```

### Dev Dependencies (existing + add)

```json
{
  "devDependencies": {
    "@cloudflare/workers-types": "^4.0.0",  // Add for D1 types
    "wrangler": "^4.0.0"                     // Already have
  }
}
```

---

## Configuration Changes

### wrangler.toml additions

```toml
# Add D1 database binding
[[d1_databases]]
binding = "DB"
database_name = "howtowincapitalism"
database_id = "" # Will be generated

# Keep KV for migration period
[[kv_namespaces]]
binding = "USERS"
id = "existing-id"

[[kv_namespaces]]
binding = "SESSIONS"
id = "existing-id"
```

---

## Decision Log

| Decision | Date | Confidence | Revisit If |
|----------|------|------------|------------|
| Keep Astro | 2025-12-14 | High | Major limitations hit |
| Use D1 | 2025-12-14 | High | 10GB not enough |
| Migrate auth to D1 | 2025-12-14 | High | Migration fails |
| CodeMirror editor | 2025-12-14 | Medium | Users want WYSIWYG |
| Pagefind search | 2025-12-14 | High | >1000 pages |
| REST APIs | 2025-12-14 | High | Complex queries needed |
