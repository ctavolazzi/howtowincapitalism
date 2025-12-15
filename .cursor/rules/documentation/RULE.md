---
description: "Documentation standards for devlogs, status reports, and architecture docs"
globs: ["_docs/**/*"]
alwaysApply: false
---

# Documentation Standards

All documentation lives in `_docs/` and follows consistent conventions.

## Required Documents

| Document | Location | Purpose |
|----------|----------|---------|
| `README.md` | Root | Project overview, quick start |
| `AGENTS.md` | Root | AI assistant instructions |
| `_docs/ARCHITECTURE.md` | `_docs/` | Technical architecture |
| `_docs/PROJECT_POLICIES.md` | `_docs/` | Standards and conventions |
| `_docs/README.md` | `_docs/` | Documentation index |

## Devlogs

Location: `_docs/devlog/`

### Naming
```
YYYY-MM-DD_devlog.md
```

Example: `2025-12-09_devlog.md`

### Structure
```markdown
# Devlog: [Month Day, Year]

**Time:** HH:MM AM/PM TZ
**Session:** [Brief description]
**Work Effort:** [[XX.XX_work-effort-name]]

---

## Summary
[What was accomplished]

## Session Log

### HH:MM — [Action]
[Details]

### HH:MM — [Action]
[Details]

---

*Session complete: HH:MM AM/PM TZ*
```

### Rules
- One file per day of active development
- Flat folder structure (no nested year/month folders)
- Link to relevant work efforts
- Include timestamps for major actions
- End sessions with completion time

## Status Reports

Location: `_docs/status_reports/`

### Naming
```
YYYY-MM-DD_[type]-status.md
```

Example: `2025-12-09_project-status.md`

## Architecture Documentation

Update `_docs/ARCHITECTURE.md` when:
- Adding new major components
- Changing folder structure
- Adding new tools or utilities
- Modifying build/deploy process

## Cross-Referencing

Use Obsidian-style links for internal references:
```markdown
See [[20.01_authentication]] for details.
Related: [[2025-12-09_devlog]]
```

## Update Triggers

Update documentation when:
1. ✅ Adding new features
2. ✅ Changing project structure
3. ✅ Modifying conventions
4. ✅ Completing work efforts
5. ✅ Making architectural decisions
