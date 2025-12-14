# First Milestone: Editable Wiki Pages

**Target:** Users can create and edit wiki pages through the web interface.
**Timeline:** 4-6 weeks
**Codename:** "Milestone Zero" (M0)

---

## Success Criteria

When M0 is complete, a user can:

1. ✅ Log in with existing credentials
2. ✅ Click "Create New Page" button
3. ✅ Enter a title and Markdown content
4. ✅ Preview the rendered page
5. ✅ Save the page to the database
6. ✅ View the saved page at its URL
7. ✅ Edit the page (if they have permission)
8. ✅ See the page in a list of all pages

---

## What's NOT in M0

- ❌ Revision history (Milestone 1)
- ❌ Diff viewer (Milestone 1)
- ❌ Talk pages (Milestone 2)
- ❌ Search beyond page list (Milestone 1)
- ❌ Categories (Milestone 1)
- ❌ Watchlists (Milestone 2)
- ❌ WYSIWYG editor (maybe never)

---

## Implementation Plan

### Week 1-2: Database Setup

**Tasks:**
1. Create D1 database in Cloudflare
2. Design and apply schema
3. Create database utility functions
4. Set up migrations system

**Database Schema (M0):**
```sql
-- Pages table (minimal)
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

CREATE INDEX idx_pages_path ON pages(path);
CREATE INDEX idx_pages_author ON pages(author_id);
```

**Files to Create:**
- `src/lib/db/client.ts` - D1 client wrapper
- `src/lib/db/schema.sql` - Schema file
- `src/lib/db/pages.ts` - Page CRUD functions

**Deliverable:** Database ready, can insert/query pages via wrangler CLI

---

### Week 3-4: Page API

**Tasks:**
1. Create page API routes
2. Implement permission checks
3. Add validation
4. Write tests

**API Endpoints:**
```
POST   /api/pages/          - Create new page
GET    /api/pages/:path     - Get page by path
PUT    /api/pages/:path     - Update page
DELETE /api/pages/:path     - Delete page (admin only)
GET    /api/pages/          - List all pages
```

**Files to Create:**
- `src/pages/api/pages/index.ts` - List & Create
- `src/pages/api/pages/[path].ts` - Read, Update, Delete

**Request/Response Examples:**

Create Page:
```json
// POST /api/pages/
{
  "path": "getting-started",
  "title": "Getting Started Guide",
  "content": "# Welcome\n\nThis is your first page.",
  "visibility": "public"
}

// Response: 201
{
  "success": true,
  "page": {
    "id": "uuid",
    "path": "getting-started",
    "title": "Getting Started Guide",
    ...
  }
}
```

**Deliverable:** Can create/read/update/delete pages via API

---

### Week 5-6: Editor UI

**Tasks:**
1. Create page editor component
2. Add Markdown preview
3. Create "New Page" flow
4. Add edit button to pages
5. Create pages index

**Files to Create:**
- `src/components/editor/PageEditor.astro` - Editor component
- `src/components/editor/MarkdownPreview.astro` - Preview pane
- `src/pages/wiki/new.astro` - New page form
- `src/pages/wiki/[...path].astro` - View/edit page
- `src/pages/wiki/index.astro` - Pages list

**UI Mockup (Editor):**
```
┌─────────────────────────────────────────────────────┐
│ Create New Page                          [Save] [×] │
├─────────────────────────────────────────────────────┤
│ Title: [________________________________]           │
│ Path:  [________________________________]           │
├───────────────────────┬─────────────────────────────┤
│ Edit                  │ Preview                     │
├───────────────────────┼─────────────────────────────┤
│ # Heading             │ Heading                     │
│                       │ ───────                     │
│ This is a paragraph   │ This is a paragraph         │
│ with **bold** text.   │ with bold text.             │
│                       │                             │
│                       │                             │
│                       │                             │
└───────────────────────┴─────────────────────────────┘
```

**UI Mockup (Page View):**
```
┌─────────────────────────────────────────────────────┐
│ [Logo] How To Win Capitalism         [User Menu]    │
├─────────────────────────────────────────────────────┤
│ Home > Wiki > Getting Started                       │
├─────────────────────────────────────────────────────┤
│                                         [Edit]      │
│ Getting Started Guide                               │
│ ─────────────────────                               │
│                                                     │
│ Welcome                                             │
│                                                     │
│ This is your first page.                            │
│                                                     │
│                                                     │
│ ─────────────────────────────────────────────────── │
│ Created by admin · Last edited 2 hours ago          │
└─────────────────────────────────────────────────────┘
```

**Deliverable:** Users can create and edit pages through the UI

---

## File Structure After M0

```
src/
├── lib/
│   ├── db/
│   │   ├── client.ts          # D1 client wrapper
│   │   ├── pages.ts           # Page CRUD functions
│   │   └── schema.sql         # Database schema
│   └── auth/                   # (existing)
├── components/
│   ├── editor/
│   │   ├── PageEditor.astro   # Main editor
│   │   └── MarkdownPreview.astro
│   └── ...                     # (existing)
├── pages/
│   ├── api/
│   │   ├── pages/
│   │   │   ├── index.ts       # List & Create
│   │   │   └── [path].ts      # CRUD by path
│   │   └── auth/              # (existing)
│   ├── wiki/
│   │   ├── index.astro        # Pages list
│   │   ├── new.astro          # Create page
│   │   └── [...path].astro    # View/edit page
│   └── ...                     # (existing pages)
```

---

## Acceptance Tests

```typescript
// tests/wiki-m0.spec.ts

test('can create a new page', async ({ page }) => {
  // Login as contributor
  await loginAs(page, 'contributor');

  // Go to new page form
  await page.goto('/wiki/new');

  // Fill out form
  await page.fill('[name="title"]', 'Test Page');
  await page.fill('[name="path"]', 'test-page');
  await page.fill('[name="content"]', '# Hello\n\nThis is a test.');

  // Submit
  await page.click('button[type="submit"]');

  // Should redirect to new page
  await expect(page).toHaveURL('/wiki/test-page/');
  await expect(page.locator('h1')).toContainText('Test Page');
});

test('can edit an existing page', async ({ page }) => {
  // Login as editor
  await loginAs(page, 'editor');

  // Go to existing page
  await page.goto('/wiki/test-page/');

  // Click edit
  await page.click('text=Edit');

  // Modify content
  await page.fill('[name="content"]', '# Updated\n\nNew content.');

  // Save
  await page.click('button[type="submit"]');

  // Should show updated content
  await expect(page.locator('article')).toContainText('New content');
});

test('viewers cannot edit', async ({ page }) => {
  // Login as viewer
  await loginAs(page, 'viewer');

  // Go to page
  await page.goto('/wiki/test-page/');

  // Edit button should not be visible
  await expect(page.locator('text=Edit')).not.toBeVisible();
});

test('pages list shows all pages', async ({ page }) => {
  await page.goto('/wiki/');

  // Should show page list
  await expect(page.locator('text=Test Page')).toBeVisible();
});
```

---

## Dependencies to Install

```bash
npm install marked        # Markdown parsing
npm install nanoid        # Generate page IDs
npm install @types/marked --save-dev
```

---

## Configuration Changes

### wrangler.toml
```toml
[[d1_databases]]
binding = "DB"
database_name = "howtowincapitalism-wiki"
database_id = ""  # Will be generated
```

### astro.config.mjs
No changes needed for M0.

---

## Migration from Static Content

**Not in M0.** Existing MDX content stays as-is. Wiki pages are a separate system at `/wiki/*`. Migration of existing content can happen later.

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| D1 doesn't work locally | Low | High | Use wrangler dev mode |
| Editor too complex | Medium | Medium | Start with textarea only |
| Permission bugs | Medium | High | Reuse existing RBAC |
| Scope creep | High | High | Strict M0 feature list |

---

## Definition of Done

M0 is complete when:

- [ ] D1 database created and schema applied
- [ ] Pages API endpoints working (create, read, update, delete, list)
- [ ] New page form accessible at /wiki/new
- [ ] Pages viewable at /wiki/[path]
- [ ] Edit button visible to authorized users
- [ ] Markdown renders correctly
- [ ] All acceptance tests passing
- [ ] Deployed to production

---

## Next Milestone (M1) Preview

After M0, the next milestone adds:
- Revision history (every edit saved)
- Diff viewer (compare versions)
- Revert functionality
- Wikilinks (`[[Page Name]]` syntax)
- Recent changes page

M1 transforms "pages you can edit" into "a wiki with history."

---

## Getting Started

To begin M0 implementation:

1. Create D1 database:
   ```bash
   wrangler d1 create howtowincapitalism-wiki
   ```

2. Apply schema:
   ```bash
   wrangler d1 execute howtowincapitalism-wiki --file=src/lib/db/schema.sql
   ```

3. Update wrangler.toml with database ID

4. Start building `src/lib/db/client.ts`

Good luck! 🚀
