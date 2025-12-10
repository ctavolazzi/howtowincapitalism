# How To Win Capitalism - Development Documentation

This folder contains internal documentation, architecture notes, and development logs.

## Contents

| Document | Purpose |
|----------|---------|
| `ARCHITECTURE.md` | System architecture, component structure, tools |
| `PROJECT_POLICIES.md` | Standards and conventions |
| `DEVLOG.md` | Development log index |
| `devlog/YYYY-MM-DD_devlog.md` | Daily development entries |
| `status_reports/` | Project status reports |

## Quick Links

- **Live Site:** https://howtowincapitalism.com
- **GitHub:** https://github.com/ctavolazzi/howtowincapitalism

## Related Documentation

| Location | Purpose |
|----------|---------|
| `/README.md` | Project overview and quick start |
| `/AGENTS.md` | AI assistant instructions |
| `/DEVELOPERS.md` | Comprehensive developer guide |
| `/.cursor/rules/` | Cursor AI rules for project conventions |
| `/src/lib/tools/README.md` | Tools API reference |
| `/_work_efforts/README.md` | Work efforts system guide |

## Cursor Rules

AI assistants follow rules defined in `.cursor/rules/`:

| Rule File | Purpose |
|-----------|---------|
| `project-structure.mdc` | Directory organization |
| `work-efforts.mdc` | Johnny Decimal task tracking |
| `documentation.mdc` | Documentation standards |
| `file-naming.mdc` | Naming conventions |

## Common Commands

```bash
# Development
npm run dev              # Start dev server

# Content
npm run new protocol my-topic   # Create new page

# Deploy
npm run ship "message"   # Build → Commit → Push → Deploy

# Validate
npm run check            # Build validation
```

## Documentation Standards

### Devlog Entries

Create daily entries at `devlog/YYYY-MM-DD_devlog.md`:

```markdown
# Devlog: Month Day, Year

**Time:** HH:MM AM/PM TZ
**Session:** Brief description
**Work Effort:** [[XX.XX_work-effort-name]]

---

## Summary
What was accomplished.

## Session Log

### HH:MM — Action
Details of what was done.

---

*Session complete: HH:MM AM/PM TZ*
```

### Work Efforts

Track tasks in `_work_efforts/` using Johnny Decimal:
- `XX-XX_category/` — Category range
- `XX_subcategory/` — Specific area
- `XX.XX_document.md` — Individual work effort

### Architecture Updates

Update `ARCHITECTURE.md` when:
- Adding new component categories
- Adding new tools/utilities
- Changing the build/deploy process
- Modifying the tech stack
