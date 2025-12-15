---
description: "File naming conventions - self-descriptive names required"
alwaysApply: true
---

# File Naming Conventions

**Rule:** All filenames must be self-descriptive without relying on their folder path.

## Format

```
[date_]descriptive-name.ext
```

Use underscores `_` to separate date from name, hyphens `-` within the name.

## Examples

### ✅ Good Names

| File | Why |
|------|-----|
| `2025-12-09_devlog.md` | Date + purpose clear |
| `decision-matrix.ts` | Describes what it does |
| `authentication-store.ts` | Feature + type |
| `project-status.md` | Clear purpose |

### ❌ Bad Names

| File | Problem | Fix |
|------|---------|-----|
| `09.md` | Just a number | `2025-12-09_devlog.md` |
| `utils.ts` | Too generic | `string-utils.ts` or `auth-utils.ts` |
| `index.md` (nested) | Relies on folder | `feature-index.md` |
| `data.json` | What data? | `mock-users.json` |

## Date Formats

| Format | Use Case | Example |
|--------|----------|---------|
| `YYYY-MM-DD` | Daily files | `2025-12-09_devlog.md` |
| `YYYY-MM` | Monthly | `2025-12_summary.md` |
| `YYYY` | Annual | `2025_retrospective.md` |

## Acceptable Generic Names

These are okay because they're universal conventions:

- `README.md` — Standard documentation
- `index.ts` / `index.mdx` — Module/route entry points (one per folder)
- `package.json`, `tsconfig.json` — Standard config files
- `.gitignore`, `.env` — Dotfiles

## Component Naming

For Astro/React components:
```
PascalCase.astro
```

Examples:
- `DecisionMatrix.astro`
- `UserProfile.astro`
- `LoginForm.astro`

## Test Files

```
[module-name].test.ts
```

Examples:
- `decision-matrix.test.ts`
- `auth-store.test.ts`
