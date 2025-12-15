---
description: "Johnny Decimal work efforts system for task tracking"
globs: ["_work_efforts/**/*"]
alwaysApply: false
---

# Work Efforts System

The `_work_efforts/` folder uses the **Johnny Decimal** system for organizing tasks and tracking progress.

## Johnny Decimal Structure

```
_work_efforts/
├── 00-09_meta/           # Organization, indexes, meta
│   └── 00_organization/
│       └── 00.00_index.md
├── 10-19_development/    # Development work
│   ├── 10_active/        # Currently in progress
│   ├── 11_completed/     # Finished work
│   └── 12_paused/        # On hold
├── 20-29_features/       # Feature development
│   └── 20_user_system/
│       ├── 20.00_index.md
│       └── 20.01_authentication.md
├── 30-39_infrastructure/ # DevOps, deployment
│   └── 30_deployment/
└── README.md
```

## Numbering Convention

| Level | Format | Example |
|-------|--------|---------|
| Category | `XX-XX_name` | `10-19_development` |
| Subcategory | `XX_name` | `10_active` |
| Document | `XX.XX_name.md` | `10.01_feature-name.md` |

## Work Effort Template

When creating a new work effort, use this structure:

```markdown
# Work Effort: [Title]

## Status: [In Progress/Completed/Paused/Cancelled]
**Started:** YYYY-MM-DD HH:MM
**Last Updated:** YYYY-MM-DD HH:MM

## Objective
[Brief description of what this work effort aims to accomplish]

## Tasks
1. [ ] Task 1
2. [ ] Task 2
3. [ ] Task 3

## Progress
- [List of completed items with dates]

## Next Steps
1. [Next immediate action]
2. [Following action]

## Notes
- [Important notes, decisions, blockers]
```

## CRUD Operations

### Create
1. Find appropriate category (10-19, 20-29, etc.)
2. Find or create subcategory
3. Use next available number (XX.01, XX.02, etc.)
4. Update subcategory index file
5. Update devlog

### Update
1. Modify document content
2. Update "Last Updated" timestamp
3. Update status if changed
4. Note progress in devlog

### Complete
1. Change status to "Completed"
2. Move to `XX_completed/` folder if applicable
3. Update indexes
4. Document in devlog

## Rules

1. **Always update indexes** when adding/removing documents
2. **Never skip numbers** — use sequential numbering
3. **Keep status current** — update on every session
4. **Link related efforts** using Obsidian-style `[[links]]`
5. **One effort per feature** — don't combine unrelated work
