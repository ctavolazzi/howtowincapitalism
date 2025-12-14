# Wiki Platform Research: Existing Solutions

**Date:** 2025-12-14
**Status:** Complete

## 1. MediaWiki (Powers Wikipedia)

### Overview
- **Language:** PHP
- **Database:** MySQL/MariaDB
- **License:** GPL v2
- **First Release:** 2002
- **Active Installations:** 50,000+

### Architecture Layers

MediaWiki uses a 10-layer architecture:

| Layer | Purpose |
|-------|---------|
| **Entity** | Core data structures (users, pages, revisions) |
| **Storage** | Database interactions, file systems |
| **Processing** | Business logic, validation, permissions |
| **Behavior** | Event handling, component orchestration |
| **API** | Internal service interfaces + external REST API |
| **User Interface** | Skins, special pages, output rendering |
| **Maintenance** | Scripts for DB migrations, cache purging |
| **Wiring** | Dependency injection, configuration |
| **Entry Point** | Request routing |
| **Installer** | Setup and configuration tools |

### Key Design Decisions

1. **Everything is a Page**
   - Articles, talk pages, user pages, categories - all stored the same way
   - Simplifies the data model significantly

2. **Revision-Based Storage**
   - Every edit creates a new revision
   - Old revisions never deleted (unless admin action)
   - Enables full history and diff viewing

3. **Wikitext Parsing**
   - Custom markup language (wikitext)
   - Server-side parsing to HTML
   - No WYSIWYG by default (VisualEditor is an extension)

4. **Extension System**
   - Core is minimal
   - Features added via hooks and extensions
   - Wikipedia runs ~500 extensions

### What Makes Wikipedia Work

1. **Scale through caching** - Varnish/CDN in front, aggressive caching
2. **Simple editing** - Anyone can edit, no approval workflow
3. **Transparent history** - Every change visible, revertable
4. **Community governance** - Policies enforced by humans, not code
5. **Neutral point of view** - Cultural norm, not technical feature

### Lessons for Our Project

- Keep the core simple, extend with modules
- Revision history is essential for trust
- "Anyone can edit" requires good revert tools
- Caching is critical for performance

---

## 2. Wiki.js (Modern Alternative)

### Overview
- **Language:** Node.js (backend), Vue.js (frontend)
- **Database:** PostgreSQL (recommended), also MySQL, SQLite, MS SQL
- **License:** AGPL v3
- **First Release:** 2017 (v2 in 2019)
- **Active Installations:** 10,000+

### Architecture

```
┌─────────────────────────────────────────┐
│           Vue.js Frontend               │
├─────────────────────────────────────────┤
│           GraphQL API Layer             │
├─────────────────────────────────────────┤
│           Node.js Backend               │
├─────────────────────────────────────────┤
│      PostgreSQL / Other Database        │
└─────────────────────────────────────────┘
```

### Database Schema (Simplified)

**Core Tables:**
- `pages` - Main content storage
- `pageHistory` - Revision tracking
- `pageTags` - Taxonomy/categories
- `pageLinks` - Internal link graph
- `pageTree` - Hierarchical structure

**User Management:**
- `users` - User accounts
- `groups` - Permission groups
- `userGroups` - Many-to-many mapping

**Modules:**
- `authentication` - Auth providers (local, OAuth, LDAP, etc.)
- `editors` - Markdown, WYSIWYG, code
- `renderers` - How content is processed
- `storage` - Where files are stored (local, S3, Git)
- `search` - Search engines (built-in, Elasticsearch, Algolia)

### Key Design Decisions

1. **Pluggable Everything**
   - Auth: 15+ providers
   - Storage: Local, Git, S3, Azure, etc.
   - Search: Built-in, Elasticsearch, Algolia
   - Editors: Markdown, Visual, Code

2. **GraphQL API**
   - Single endpoint for all data
   - Type-safe queries
   - Efficient data fetching

3. **Git Integration**
   - Can sync content to/from Git repos
   - Enables version control outside the wiki

4. **Multiple Editors**
   - Markdown (most common)
   - WYSIWYG (for non-technical users)
   - Raw HTML
   - Code editor

### What Wiki.js Does Well

1. **Modern UX** - Clean, responsive, intuitive
2. **Easy Setup** - Docker or single binary
3. **Flexible Storage** - Git sync is killer feature
4. **Good Permissions** - Page-level access control
5. **Active Development** - Regular updates

### What Wiki.js Lacks

1. **Talk Pages** - No built-in discussion per page
2. **Community Features** - No watchlists, user contributions
3. **Scale** - Not proven at Wikipedia scale
4. **Extensions** - Less extensible than MediaWiki

### Lessons for Our Project

- GraphQL API is a good pattern for flexibility
- Git sync is valuable for developer-centric wikis
- Multiple editor support is user-friendly
- Clean UI matters more than we think

---

## 3. Comparison Matrix

| Feature | MediaWiki | Wiki.js | Our Project (Current) |
|---------|-----------|---------|----------------------|
| Language | PHP | Node.js | TypeScript/Astro |
| Database | MySQL | PostgreSQL | None (files) |
| Content Format | Wikitext | Markdown | MDX |
| WYSIWYG | Extension | Built-in | None |
| User Auth | Built-in | Pluggable | Mock/localStorage |
| Revision History | Core | Core | Git only |
| Talk Pages | Core | None | None |
| API | REST + Action | GraphQL | REST (partial) |
| Search | Built-in | Pluggable | Basic |
| Extensions | 500+ | Limited | None |
| Hosting | Self-host | Self-host | Cloudflare Pages |

---

## 4. Key Takeaways

### What Wikipedia Teaches Us
1. Simple data model (everything is a page with revisions)
2. Transparent edit history builds trust
3. Community matters more than technology
4. Performance = caching at every layer

### What Wiki.js Teaches Us
1. Modern tech stack is more maintainable
2. GraphQL API provides flexibility
3. Multiple editors serve different users
4. Git integration is powerful for developers

### Questions to Answer
1. Do we need Wikipedia-scale features or Wiki.js-level is enough?
2. Is Git-based version control sufficient or do we need database revisions?
3. How important is real-time collaboration?
4. What's our user base: technical (Markdown) or general (WYSIWYG)?

---

## 5. Next Steps

- [ ] Audit current project capabilities
- [ ] Define feature tiers (MVP vs future)
- [ ] Choose build vs fork approach
- [ ] Select technology stack
