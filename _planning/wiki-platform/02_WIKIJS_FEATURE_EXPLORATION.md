# Wiki.js Feature Exploration

**Date:** 2025-12-14
**Status:** Complete (Documentation-based - Docker not available on macOS 12.6.0)

## Overview

Since local Docker installation is not available, this exploration is based on Wiki.js documentation, demo sites, and source code analysis.

## Core Features Analysis

### 1. Page Editing

**Multiple Editor Types:**
| Editor | Format | Best For |
|--------|--------|----------|
| Markdown | `.md` | Developers, technical writers |
| Visual Editor | WYSIWYG | Non-technical users |
| AsciiDoc | `.adoc` | Complex documentation |
| Raw HTML | `.html` | Full control |
| Code | Various | Code snippets |

**Key Insight:** Supporting multiple editors from day one adds complexity but serves different user types.

### 2. Revision History

**How Wiki.js Handles Revisions:**
```
pages table
├── id
├── path
├── title
├── content (current)
├── createdAt
└── updatedAt

pageHistory table
├── id
├── pageId (FK)
├── path
├── title
├── content (snapshot)
├── action (created|updated|deleted|moved)
├── authorId
├── createdAt
└── versionNumber
```

**Features:**
- Full content snapshots per revision (not diffs)
- View any historical version
- Compare any two versions (diff view)
- Restore previous versions
- Track who made what change

**Key Insight:** Full snapshots are simpler but use more storage. Diffs save space but are harder to implement.

### 3. Permission System

**Wiki.js Permission Model:**

```
Groups
├── Administrators (full access)
├── Editors (read + write)
├── Members (read + limited write)
└── Guests (read only)

Permissions (per group, per page path)
├── read:pages
├── write:pages
├── manage:pages (delete, move)
├── write:comments
├── read:history
├── write:scripts
└── manage:users
```

**Path-Based Rules:**
- `/*` - Apply to all pages
- `/docs/*` - Apply to docs section
- `/private/secret` - Specific page

**Key Insight:** Path-based permissions are intuitive and flexible. Better than page-by-page ACLs.

### 4. Search

**Built-in Search:**
- Full-text search on title + content
- Filter by tags, path
- Search suggestions

**External Search Engines:**
- Elasticsearch (for scale)
- Algolia (SaaS, fast)
- Manticore (open source Elasticsearch alternative)
- AWS OpenSearch

**Key Insight:** Start with built-in search, plan for external engine at scale.

### 5. Storage Options

**Where Content Lives:**
| Storage Type | Use Case |
|--------------|----------|
| Database | Default, simplest |
| Git | Sync to/from repos, version control |
| AWS S3 | Media files |
| Azure Blob | Microsoft ecosystem |
| Local Disk | Self-hosted, full control |

**Git Sync Feature:**
- Bidirectional sync with Git repos
- Content can be edited in Git OR Wiki.js
- Auto-commit on save
- Support for GitHub, GitLab, Bitbucket

**Key Insight:** Git sync is powerful for developer-centric wikis. Enables editing in VS Code, PRs for changes, etc.

### 6. Authentication

**Supported Auth Providers (15+):**
- Local (username/password)
- OAuth 2.0 (Google, GitHub, etc.)
- LDAP/Active Directory
- SAML 2.0
- Auth0
- Keycloak
- Azure AD
- Okta
- And more...

**Key Insight:** Auth is solved. Use existing providers rather than building custom.

### 7. Media Management

**Asset Handling:**
- Upload images, PDFs, videos
- Organize in folders
- Inline in content
- Storage backends (local, S3, Azure)

**Key Insight:** Media management is often underestimated. Plan for it early.

## Features Wiki.js LACKS

1. **Talk/Discussion Pages** - No per-page discussion like Wikipedia
2. **Watchlists** - Can't track changes to specific pages
3. **User Contributions Page** - No "what did this user edit"
4. **Edit Conflicts** - Limited real-time conflict resolution
5. **Templates** - No transclusion (embedding page in another)
6. **Categories** - Tags only, no hierarchical categories
7. **Interwiki Links** - No cross-wiki linking

## Database Schema Deep Dive

**Core Tables:**
```sql
-- Pages
pages: id, path, hash, title, description, isPrivate, 
       isPublished, content, render, toc, contentType,
       createdAt, updatedAt, editorKey, localeCode,
       authorId, creatorId

-- Page History (Revisions)
pageHistory: id, path, hash, title, description, 
             isPrivate, isPublished, content, 
             action, actionDate, authorId, 
             pageId, versionNumber

-- Page Links (for "what links here")
pageLinks: id, path, localeCode, pageId

-- Page Tags
pageTags: id, tag, title, createdAt, updatedAt

-- Users
users: id, email, name, providerId, password,
       tfaIsActive, tfaSecret, jobTitle, location,
       pictureUrl, timezone, isSystem, isActive, 
       isVerified, mustChangePwd, createdAt, updatedAt

-- Groups
groups: id, name, permissions, pageRules, 
        isSystem, createdAt, updatedAt

-- User Groups (many-to-many)
userGroups: id, userId, groupId
```

**Key Insight:** The schema is relatively simple. The complexity is in the business logic, not the data model.

## Architecture Diagram

```
┌────────────────────────────────────────────────────────┐
│                    Frontend (Vue.js)                    │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │
│  │ Viewer  │  │ Editor  │  │ Admin   │  │ Search  │   │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘   │
└───────┼────────────┼────────────┼────────────┼────────┘
        │            │            │            │
        └────────────┴─────┬──────┴────────────┘
                           │
┌──────────────────────────┼─────────────────────────────┐
│                    GraphQL API                          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │
│  │ Pages   │  │ Users   │  │ Search  │  │ Assets  │   │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘   │
└───────┼────────────┼────────────┼────────────┼────────┘
        │            │            │            │
┌───────┼────────────┼────────────┼────────────┼────────┐
│       │    Core Services (Node.js)           │        │
│  ┌────┴────┐  ┌────┴────┐  ┌────┴────┐  ┌───┴────┐   │
│  │ Content │  │  Auth   │  │ Search  │  │ Media  │   │
│  │ Manager │  │ Manager │  │ Engine  │  │ Handler│   │
│  └────┬────┘  └────┬────┘  └────┬────┘  └───┬────┘   │
└───────┼────────────┼────────────┼───────────┼────────┘
        │            │            │           │
┌───────┼────────────┼────────────┼───────────┼────────┐
│       │    Data Layer                       │        │
│  ┌────┴────────────┴────────────┴───────────┴────┐   │
│  │              PostgreSQL Database               │   │
│  └────────────────────────────────────────────────┘   │
│  ┌────────────────┐  ┌────────────────────────────┐   │
│  │  Git Storage   │  │     S3/Blob Storage        │   │
│  └────────────────┘  └────────────────────────────┘   │
└───────────────────────────────────────────────────────┘
```

## What to Take from Wiki.js

### Adopt
1. **Multiple editors** - Support Markdown AND visual
2. **Path-based permissions** - Intuitive and flexible
3. **Git sync option** - Developer-friendly
4. **GraphQL API** - Flexible and efficient
5. **Clean schema** - Don't over-engineer data model

### Avoid
1. **Lack of discussions** - Add talk pages from start
2. **No watchlists** - Users want to track changes
3. **Limited real-time** - Consider collaboration features

## Comparison to Current Project

| Feature | Wiki.js | howtowincapitalism |
|---------|---------|-------------------|
| Content storage | Database | MDX files |
| Editing | Web UI | Developer only |
| Revision history | Database | Git commits |
| Auth | 15+ providers | Mock/localStorage |
| Permissions | Path-based groups | Role-based |
| Search | Pluggable | Basic |
| Comments | None | None |

## Next Steps

- Audit current project in detail
- Define which Wiki.js features are essential
- Decide: extend current project or build new
