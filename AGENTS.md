# AGENTS.md

AI assistant instructions for the How To Win Capitalism project.

## Project Overview

A satirical but practical wiki about financial autonomy, built with Astro + Starlight.

**Stack:**
- Astro 5.x with Starlight documentation theme
- TypeScript for utilities
- MDX for content pages
- Cloudflare Pages for hosting

## Project Structure

```
howtowincapitalism/
├── _docs/                # Documentation (devlogs, architecture, policies)
├── _work_efforts/        # Task tracking (Johnny Decimal system)
├── src/
│   ├── components/       # Astro components (atomic design)
│   ├── content/docs/     # MDX wiki pages
│   ├── lib/tools/        # Utilities (decision-matrix, logger)
│   ├── pages/            # Route pages
│   └── styles/           # CSS overrides
├── scripts/              # Build automation
└── public/               # Static assets
```

## Critical Rules

### 1. File Naming
All filenames must be self-descriptive without relying on folder path.

```
✅ 2025-12-09_devlog.md
❌ 09.md
```

### 2. Documentation Updates
When making changes:
1. Update relevant `_docs/` file
2. Update or create work effort in `_work_efforts/`
3. Update devlog if in active session

### 3. Work Efforts
Use Johnny Decimal system:
- `XX-XX_category/` (e.g., `10-19_development/`)
- `XX_subcategory/` (e.g., `10_active/`)
- `XX.XX_document.md` (e.g., `10.01_feature.md`)

### 4. No Nested Date Folders
```
✅ _docs/devlog/2025-12-09_devlog.md
❌ _docs/devlog/2025/12/09.md
```

### 5. Tools Location
Development utilities go in `src/lib/tools/`, not a separate `_dev/` folder.

## Cursor Rules

See `.cursor/rules/` for detailed conventions:
- `project-structure.mdc` — Directory organization
- `work-efforts.mdc` — Johnny Decimal system
- `documentation.mdc` — Documentation standards
- `file-naming.mdc` — Naming conventions

## Common Tasks

### Starting a New Feature
1. Create work effort: `_work_efforts/20-29_features/XX_category/XX.XX_feature.md`
2. Update devlog: `_docs/devlog/YYYY-MM-DD_devlog.md`
3. Implement in `src/`
4. Update work effort status on completion

### Adding a Tool/Utility
1. Create in `src/lib/tools/your-tool.ts`
2. Export from `src/lib/tools/index.ts`
3. Document in `src/lib/tools/README.md`

### Creating Content
1. Add MDX file to `src/content/docs/[section]/`
2. Update section index if needed

## Key Files

| File | Purpose |
|------|---------|
| `_docs/PROJECT_POLICIES.md` | Standards and conventions |
| `_docs/ARCHITECTURE.md` | Technical architecture |
| `_docs/devlog/` | Daily development logs |
| `src/lib/tools/README.md` | Tools documentation |
| `astro.config.mjs` | Astro + Starlight config |

## Git Commits

Use conventional commits:
```
feat: add user authentication
fix: resolve login redirect issue
docs: update architecture diagram
chore: consolidate utilities
```

## Do Not

- ❌ Create `_dev/` folder (use `src/lib/tools/`)
- ❌ Create nested date folders (`2025/12/09.md`)
- ❌ Use generic filenames (`utils.ts`, `data.json`)
- ❌ Skip documentation updates
- ❌ Leave work efforts without status updates
