# Component Planning System

> A standardized, repeatable process for planning software components with AI assistance.

---

## Quick Start

```bash
# 1. Copy session template
cp templates/SESSION_TEMPLATE.md sessions/$(date +%Y-%m-%d)_component-name.md

# 2. Open with AI assistant in Plan mode

# 3. Use prompts from templates/PROMPTS.md

# 4. Result: Approved plan at .cursor/plans/
```

---

## Documentation

| Document | Purpose | When to Read |
|----------|---------|--------------|
| [BRIEFING.md](BRIEFING.md) | Military-style overview of the entire system | First, for understanding |
| [OPERATIONS_MANUAL.md](OPERATIONS_MANUAL.md) | Step-by-step procedures | During execution |
| [templates/PROMPTS.md](templates/PROMPTS.md) | Copy-paste prompts for AI | During sessions |
| [templates/CRITIQUE_CHECKLIST.md](templates/CRITIQUE_CHECKLIST.md) | Plan evaluation criteria | During Phase V |

---

## The Seven Phases

| Phase | Name | Key Activity | Output |
|-------|------|--------------|--------|
| I | Requirements | Ask clarifying questions | Requirements table |
| II | Discovery | Examine codebase | Constraints list |
| III | Selection | Present 3+ options | User decision |
| IV | Formulation | Write plan document | `.cursor/plans/*.plan.md` |
| V | Critique | "Harshly criticize your plan" | Flaw list |
| VI | Revision | Fix flaws, re-critique | Clean plan |
| VII | Approval | Get explicit approval | Go/no-go |

---

## Folder Structure

```
_planning/
├── README.md                      # This file (start here)
├── BRIEFING.md                    # System overview
├── OPERATIONS_MANUAL.md           # Detailed procedures
├── templates/
│   ├── SESSION_TEMPLATE.md        # Copy for each session
│   ├── PROMPTS.md                 # AI prompts by phase
│   ├── CRITIQUE_CHECKLIST.md      # Plan evaluation
│   └── PLAN_TEMPLATE.md           # Final plan structure
└── sessions/
    └── YYYY-MM-DD_component.md    # Completed sessions
```

---

## The Most Important Prompt

After creating any plan, always use this:

> **"Now harshly criticize your plan. Disprove yourself if you can."**

This single prompt prevents over-engineering and catches requirement gaps.

---

## Key Principles

### 1. Start Simple
Begin with the dumbest possible solution. Add complexity only when required.

### 2. Name Tensions
If requirements conflict, name the tension explicitly. Don't hide it.

### 3. Two Critique Rounds
First critique catches over-engineering. Second critique checks alignment.

### 4. Document Decisions
Every decision should have: ID, choice, rationale, and rejected alternatives.

### 5. Explicit Approval
Never proceed without clear user approval.

---

## Process Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│   USER REQUEST                                                   │
│        │                                                         │
│        ▼                                                         │
│   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐        │
│   │ Phase I │──►│Phase II │──►│Phase III│──►│Phase IV │        │
│   │ Require │   │Discovery│   │Selection│   │  Plan   │        │
│   └─────────┘   └─────────┘   └─────────┘   └────┬────┘        │
│                                                   │              │
│                                                   ▼              │
│   ┌─────────┐   ┌─────────┐   ┌─────────┐◄──────┘              │
│   │Phase VII│◄──│Phase VI │◄──│ Phase V │                       │
│   │Approval │   │Revision │   │Critique │                       │
│   └────┬────┘   └────┬────┘   └────┬────┘                       │
│        │             │             │                             │
│        │             └─────────────┘                             │
│        │              (loop until clean)                         │
│        ▼                                                         │
│   IMPLEMENTATION                                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Checklists

### Before Starting
- [ ] Session file created from template
- [ ] AI in Plan mode (not Agent)
- [ ] User has stated initial requirement

### Before Approving
- [ ] All requirements addressed (R-XXX)
- [ ] Minimum 2 critique rounds
- [ ] No CRITICAL/HIGH flaws remain
- [ ] All decisions documented (D-XXX)
- [ ] Plan document exists

### After Completing
- [ ] Session file filled out
- [ ] Devlog updated
- [ ] Changes committed

---

## Example Session

See [sessions/2025-12-13_trade-widget.md](sessions/2025-12-13_trade-widget.md) for a complete example of this process in action.

---

## Related Documentation

| Location | Purpose |
|----------|---------|
| `_docs/COMPONENT_PLANNING_PROCESS.md` | Legal-style process documentation |
| `.cursor/plans/` | Generated plan documents |
| `.cursorrules` | Project constraints |
| `AGENTS.md` | AI assistant instructions |

---

## Version

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Created | 2025-12-13 |
| Last Updated | 2025-12-13 |
