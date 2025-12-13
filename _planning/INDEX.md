# COMPONENT PLANNING SYSTEM - MASTER INDEX

## DOCUMENT REGISTRY

| ID | Document | Purpose | Location |
|----|----------|---------|----------|
| CPO-IDX-001 | Master Index | This document | `INDEX.md` |
| CPO-README-001 | Quick Start Guide | Entry point | `README.md` |
| CPO-BRIEF-001 | Operations Briefing | System overview | `BRIEFING.md` |
| CPO-OPS-001 | Operations Manual | Procedures | `OPERATIONS_MANUAL.md` |
| CPO-TPL-001 | Session Template | Planning sessions | `templates/SESSION_TEMPLATE.md` |
| CPO-TPL-002 | Prompt Library | AI prompts | `templates/PROMPTS.md` |
| CPO-TPL-003 | Critique Checklist | Plan evaluation | `templates/CRITIQUE_CHECKLIST.md` |
| CPO-TPL-004 | Plan Template | Plan structure | `templates/PLAN_TEMPLATE.md` |

---

## READING ORDER

### For New Users

1. `README.md` — Understand what this is
2. `BRIEFING.md` — Understand the full system
3. `templates/PROMPTS.md` — Learn the key prompts
4. `sessions/2025-12-13_trade-widget.md` — See an example

### For Executing a Session

1. Copy `templates/SESSION_TEMPLATE.md` to `sessions/`
2. Reference `templates/PROMPTS.md` during session
3. Use `templates/CRITIQUE_CHECKLIST.md` in Phase V
4. Use `templates/PLAN_TEMPLATE.md` for plan structure
5. Reference `OPERATIONS_MANUAL.md` if stuck

### For Understanding the Process

1. `BRIEFING.md` — Complete system overview
2. `OPERATIONS_MANUAL.md` — Detailed procedures
3. `_docs/COMPONENT_PLANNING_PROCESS.md` — Origin documentation

---

## QUICK REFERENCE

### The Seven Phases

```
I.   Requirements Gathering  → Ask questions, document needs
II.  Technical Discovery     → Examine codebase, find constraints
III. Architecture Selection  → Present options, get decision
IV.  Plan Formulation        → Write the plan document
V.   Critical Review         → "Harshly criticize your plan"
VI.  Plan Revision           → Fix flaws, re-critique
VII. Final Approval          → Get explicit go-ahead
```

### Critical Prompts

| Phase | Prompt |
|-------|--------|
| I | "What information do you need from me?" |
| III | "What are the tradeoffs between these options?" |
| V | "Now harshly criticize your plan. Disprove yourself if you can." |
| VI | "Now criticize this NEW plan just as harshly. Does it align with my original goals?" |
| VII | "Let's build it." |

### File Naming

| Type | Format | Example |
|------|--------|---------|
| Session | `YYYY-MM-DD_component.md` | `2025-12-13_trade-widget.md` |
| Plan | `component_[hash].plan.md` | `trade_widget_b150735e.plan.md` |

### ID Formats

| Type | Format | Example |
|------|--------|---------|
| Requirement | `R-XXX` | `R-001` |
| Flaw | `F-XXX` | `F-001` |
| Decision | `D-XXX` | `D-001` |
| Task | `T-XXX` | `T-001` |

---

## SYSTEM OUTPUTS

### Per Session

| Output | Location |
|--------|----------|
| Session record | `_planning/sessions/YYYY-MM-DD_*.md` |
| Plan document | `.cursor/plans/*.plan.md` |
| Devlog entry | `_docs/devlog/YYYY-MM-DD_devlog.md` |

### Permanent Documentation

| Output | Location |
|--------|----------|
| Process documentation | `_docs/COMPONENT_PLANNING_PROCESS.md` |
| This system | `_planning/` |

---

## CROSS-REFERENCES

### This System References

| Document | Purpose |
|----------|---------|
| `.cursorrules` | Project constraints |
| `AGENTS.md` | AI instructions |
| `src/components/` | Existing patterns |
| `package.json` | Dependencies |

### This System Is Referenced By

| Document | How |
|----------|-----|
| `_docs/README.md` | Listed in documentation index |
| `_docs/devlog/*.md` | Session outcomes |
| `.cursor/plans/*.md` | Generated plans |

---

## MAINTENANCE

### When to Update This System

- After completing a session, if process improvements identified
- When new templates are needed
- When procedures change

### Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-13 | Initial system creation |

---

## CONTACT

For questions about this system, see the original development session:
- `sessions/2025-12-13_trade-widget.md`
- `_docs/COMPONENT_PLANNING_PROCESS.md`

---

**END OF INDEX**
