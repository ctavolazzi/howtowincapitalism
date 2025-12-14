# Feature Tiers: Wiki Platform Roadmap

**Date:** 2025-12-14
**Status:** Complete

## Tier Overview

| Tier | Name | Focus | Timeline |
|------|------|-------|----------|
| 0 | Foundation | Database + basic editing | 4-6 weeks |
| 1 | MVP Wiki | Revision history + search | 4-6 weeks |
| 2 | Community | Discussions + profiles | 4-6 weeks |
| 3 | Scale | Moderation + performance | 4-6 weeks |
| 4 | Expansion | Video + mobile + API | Ongoing |

---

## Tier 0: Foundation (Pre-MVP)

**Goal:** Users can create and edit pages through a web interface.

### Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Database setup | D1 schema for pages, users | Critical |
| Page CRUD API | Create, read, update, delete pages | Critical |
| Basic editor | Markdown textarea with preview | Critical |
| Auth migration | Move users from KV to D1 | Critical |
| Permission checks | Use existing RBAC for editing | Critical |

### Database Schema (Minimal)

```sql
-- Pages table
CREATE TABLE pages (
  id TEXT PRIMARY KEY,
  path TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id TEXT NOT NULL,
  visibility TEXT DEFAULT 'public',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Users table (migrate from KV)
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  access_level INTEGER NOT NULL,
  avatar TEXT,
  bio TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT NOT NULL
);
```

### User Stories

1. As a contributor, I can create a new page with a title and content
2. As an editor, I can edit any existing page
3. As a viewer, I can read public pages
4. As an admin, I can delete pages

### Definition of Done

- [ ] D1 database created and schema applied
- [ ] Pages can be created via web form
- [ ] Pages can be edited via web form
- [ ] Pages render with existing layout
- [ ] Permissions enforced on all operations

---

## Tier 1: MVP Wiki

**Goal:** The system behaves like a wiki with history and navigation.

### Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Revision history | Store every edit as a new version | Critical |
| View history | See list of all revisions | Critical |
| Diff viewer | Compare any two versions | High |
| Revert | Restore previous version | High |
| Wikilinks | `[[Page Name]]` syntax links | High |
| Recent changes | Global feed of edits | High |
| Basic search | Full-text search on title/content | Medium |
| Categories | Tag pages for organization | Medium |

### Database Schema (Additions)

```sql
-- Page revisions
CREATE TABLE page_revisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_id TEXT NOT NULL,
  revision_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id TEXT NOT NULL,
  edit_summary TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (page_id) REFERENCES pages(id)
);

-- Categories
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  description TEXT
);

-- Page-Category mapping
CREATE TABLE page_categories (
  page_id TEXT NOT NULL,
  category_id INTEGER NOT NULL,
  PRIMARY KEY (page_id, category_id),
  FOREIGN KEY (page_id) REFERENCES pages(id),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

### User Stories

1. As a user, I can see the edit history of any page
2. As a user, I can compare two versions of a page
3. As an editor, I can revert vandalism to a previous version
4. As a user, I can link to other pages using `[[Page Name]]`
5. As a user, I can see recent changes across the wiki
6. As a user, I can search for pages by title or content
7. As a user, I can browse pages by category

### Definition of Done

- [ ] Every edit creates a new revision
- [ ] History page shows all revisions with author/date
- [ ] Diff viewer highlights changes between versions
- [ ] Editors can revert to any previous version
- [ ] Wikilinks render as clickable links
- [ ] Recent changes page shows latest edits
- [ ] Search returns relevant pages
- [ ] Categories can be assigned and browsed

---

## Tier 2: Community

**Goal:** Users can discuss content and build reputation.

### Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Talk pages | Discussion thread per page | High |
| User contributions | See all edits by a user | High |
| Watchlist | Track pages you care about | High |
| Notifications | Alerts for watched pages | Medium |
| User profiles | Enhanced profile pages | Medium |
| Edit conflicts | Handle simultaneous edits | Medium |
| Signatures | `~~~~` adds user signature | Low |

### Database Schema (Additions)

```sql
-- Talk threads
CREATE TABLE talk_threads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_id TEXT NOT NULL,
  title TEXT NOT NULL,
  author_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (page_id) REFERENCES pages(id)
);

-- Talk messages
CREATE TABLE talk_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  thread_id INTEGER NOT NULL,
  author_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (thread_id) REFERENCES talk_threads(id)
);

-- Watchlist
CREATE TABLE watchlist (
  user_id TEXT NOT NULL,
  page_id TEXT NOT NULL,
  added_at TEXT NOT NULL,
  PRIMARY KEY (user_id, page_id)
);

-- Notifications
CREATE TABLE notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);
```

### User Stories

1. As a user, I can discuss a page on its talk page
2. As a user, I can see all my contributions
3. As a user, I can add pages to my watchlist
4. As a user, I get notifications when watched pages change
5. As an editor, I'm warned if someone else is editing the same page
6. As a user, I can view detailed profiles of other users

### Definition of Done

- [ ] Each page has a talk page accessible via tab
- [ ] Talk pages support threaded discussions
- [ ] User contributions page shows edit history
- [ ] Watchlist page shows tracked pages
- [ ] Notifications appear for watched page edits
- [ ] Edit conflict warning when two users edit simultaneously
- [ ] User profiles show edit count, join date, etc.

---

## Tier 3: Scale

**Goal:** Handle growth with moderation and performance.

### Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Page protection | Lock pages from editing | High |
| User blocking | Block problematic users | High |
| Vandalism detection | Flag suspicious edits | Medium |
| Admin dashboard | Moderation tools | Medium |
| Caching | Redis/KV for performance | High |
| Rate limiting | Prevent abuse | High |
| Audit logs | Track admin actions | Medium |
| Page moves | Rename with redirects | Low |

### User Stories

1. As an admin, I can protect a page from editing
2. As an admin, I can block a user from editing
3. As an admin, I can review flagged edits
4. As an admin, I can see audit logs of all admin actions
5. As a user, pages load quickly even with traffic
6. As a user, I'm rate-limited if I edit too fast

### Definition of Done

- [ ] Admins can protect/unprotect pages
- [ ] Admins can block/unblock users
- [ ] Suspicious edits are flagged for review
- [ ] Admin dashboard shows pending moderation
- [ ] Page views are cached effectively
- [ ] Rate limiting prevents edit spam
- [ ] All admin actions logged with timestamp

---

## Tier 4: Expansion (Future)

**Goal:** Extend platform beyond text wiki.

### Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Forum system | Standalone discussion forums | Medium |
| Video content | TikTok-style short videos | Low |
| Mobile app | Native iOS/Android | Low |
| Public API | REST/GraphQL for integrations | Medium |
| Plugins | Extension system | Low |
| Themes | Custom styling per user | Low |
| Multi-language | i18n support | Medium |
| Federation | Connect with other wikis | Low |

### Not Prioritized Yet

These features are interesting but not defined:
- AI-assisted editing
- Real-time collaborative editing (Google Docs style)
- Blockchain-based edit verification
- Gamification (badges, achievements)

---

## Timeline Visualization

```
Month 1-2: TIER 0 (Foundation)
├── Week 1-2: Database setup, schema
├── Week 3-4: Page CRUD API
├── Week 5-6: Basic editor UI
└── Milestone: Users can create/edit pages

Month 3-4: TIER 1 (MVP Wiki)
├── Week 7-8: Revision history
├── Week 9-10: Diff viewer, revert
├── Week 11-12: Wikilinks, search
└── Milestone: It behaves like a wiki

Month 5-6: TIER 2 (Community)
├── Week 13-14: Talk pages
├── Week 15-16: Watchlist, notifications
├── Week 17-18: User profiles, contributions
└── Milestone: Community features work

Month 7-8: TIER 3 (Scale)
├── Week 19-20: Moderation tools
├── Week 21-22: Caching, performance
├── Week 23-24: Admin dashboard
└── Milestone: Ready for growth

Month 9+: TIER 4 (Expansion)
└── Ongoing feature development
```

---

## MVP Definition

**Minimum Viable Wiki = Tier 0 + Tier 1**

Users can:
- ✅ Create and edit pages
- ✅ View edit history
- ✅ Revert bad edits
- ✅ Link between pages
- ✅ Search for content
- ✅ Browse recent changes

This is enough to be useful as a wiki. Community features (Tier 2) make it engaging but aren't essential for launch.

---

## Decision Points

Before starting implementation, decide:

1. **Editor type:** Markdown-only or WYSIWYG too?
2. **Real-time:** Simultaneous editing or sequential?
3. **Storage:** D1 (Cloudflare) or Supabase (PostgreSQL)?
4. **Search:** Built-in or external (Algolia/Meilisearch)?
5. **Hosting:** Stay on Cloudflare or expand?

These decisions affect architecture significantly.
