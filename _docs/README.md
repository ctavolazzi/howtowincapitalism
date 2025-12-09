# How To Win Capitalism - Development Documentation

This folder contains internal documentation, architecture notes, and development logs.

## Contents

| Document | Purpose |
|----------|---------|
| `ARCHITECTURE.md` | System architecture, component structure, tools |
| `AUDIT.md` | Site audit and recommendations |
| `DEVLOG.md` | Development log and decisions |
| `devlog/YYYY/MM/DD.md` | Daily development entries |
| `status_reports/` | Project manager status reports |

## Quick Links

- **Live Site:** https://howtowincapitalism.com
- **GitHub:** https://github.com/ctavolazzi/howtowincapitalism

## Related Documentation

| Location | Purpose |
|----------|---------|
| `/README.md` | Project overview and quick start |
| `/DEVELOPERS.md` | Comprehensive developer guide |
| `/src/lib/tools/README.md` | Tools API reference |

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

Create daily entries at `devlog/YYYY/MM/DD.md`:

```markdown
# Devlog: Month Day, Year

**Time:** HH:MM PM

## Summary
What was accomplished.

## Decisions Made
Key decisions and rationale.

## Issues Found
Bugs discovered and fixes.

## Next Steps
- [ ] Todo items
```

### Architecture Updates

Update `ARCHITECTURE.md` when:
- Adding new component categories
- Adding new tools/utilities
- Changing the build/deploy process
- Modifying the tech stack
