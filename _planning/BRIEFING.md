# COMPONENT PLANNING OPERATIONS BRIEFING

## CLASSIFICATION: UNCLASSIFIED // FOR OFFICIAL USE ONLY

---

## DOCUMENT CONTROL

| Field | Value |
|-------|-------|
| Document ID | CPO-BRIEF-001 |
| Version | 1.0.0 |
| Date | 2025-12-13 |
| Author | AI Planning System |
| Classification | UNCLASSIFIED |
| Distribution | All Development Personnel |

---

## TABLE OF CONTENTS

1. [SITUATION](#1-situation)
2. [MISSION](#2-mission)
3. [EXECUTION](#3-execution)
4. [ADMINISTRATION AND LOGISTICS](#4-administration-and-logistics)
5. [COMMAND AND SIGNAL](#5-command-and-signal)

---

## 1. SITUATION

### 1.1 Background

Component development in modern software projects frequently suffers from:

- (a) **Scope creep** — Features added without explicit requirement
- (b) **Over-engineering** — Complexity exceeding actual need
- (c) **Requirement drift** — Final implementation diverging from original intent
- (d) **Undocumented decisions** — Lost rationale for architectural choices
- (e) **Non-repeatable processes** — Each component planned differently

### 1.2 Problem Statement

There exists no standardized, repeatable process for planning software components that:

- (a) Captures requirements accurately
- (b) Explores technical constraints systematically
- (c) Presents architectural options with tradeoffs
- (d) Self-critiques to prevent over-engineering
- (e) Documents all decisions and alternatives
- (f) Produces actionable implementation plans

### 1.3 Current Assets

| Asset | Location | Purpose |
|-------|----------|---------|
| Session Template | `templates/SESSION_TEMPLATE.md` | Planning session structure |
| Prompt Library | `templates/PROMPTS.md` | Standardized AI prompts |
| Critique Checklist | `templates/CRITIQUE_CHECKLIST.md` | Plan evaluation criteria |
| Plan Template | `templates/PLAN_TEMPLATE.md` | Final deliverable format |
| Process Documentation | `_docs/COMPONENT_PLANNING_PROCESS.md` | Methodology reference |

### 1.4 Operating Environment

- **Platform:** Cursor IDE with AI assistant
- **Target:** Astro-based web applications
- **Constraints:** Per `.cursorrules` and `AGENTS.md`
- **Output:** `.cursor/plans/*.plan.md` documents

---

## 2. MISSION

### 2.1 Mission Statement

Establish and execute a standardized seven-phase component planning operation that transforms user requirements into approved, actionable implementation plans with full decision documentation.

### 2.2 Commander's Intent

The purpose of this operation is to **eliminate ad-hoc component planning** and replace it with a **repeatable, self-correcting process** that any developer or AI system can execute to produce consistent, high-quality plans.

### 2.3 End State

Upon successful completion:

- (a) A formal plan document exists at `.cursor/plans/`
- (b) All requirements are addressed or explicitly deferred
- (c) Architectural decisions are documented with rationale
- (d) The plan has survived two rounds of self-critique
- (e) The user has explicitly approved implementation

### 2.4 Success Criteria

| Criterion | Metric |
|-----------|--------|
| Requirements Coverage | 100% addressed or documented as deferred |
| Critique Rounds | Minimum 2 |
| Decision Documentation | All decisions logged with alternatives |
| User Approval | Explicit confirmation received |

---

## 3. EXECUTION

### 3.1 Concept of Operations

The operation proceeds through seven sequential phases. Each phase has specific objectives, inputs, outputs, and completion criteria. No phase may be skipped.

```
┌─────────────────────────────────────────────────────────────────┐
│                    OPERATIONAL FLOW                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   PHASE I ──► PHASE II ──► PHASE III ──► PHASE IV               │
│   Requirements  Discovery    Selection    Formulation           │
│                                               │                  │
│                                               ▼                  │
│   PHASE VII ◄── PHASE VI ◄── PHASE V ◄───────┘                  │
│   Approval      Revision     Critique                           │
│                                                                  │
│   ┌─────────────────────────────────────┐                       │
│   │ CRITICAL: Phase V may loop back to │                       │
│   │ Phase VI multiple times until all  │                       │
│   │ flaws are resolved.                │                       │
│   └─────────────────────────────────────┘                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Phase I: Requirements Gathering

#### 3.2.1 Objective

Extract, document, and confirm all user requirements.

#### 3.2.2 Tasks

| Task | Action | Output |
|------|--------|--------|
| I-1 | Receive initial user request | Raw requirement text |
| I-2 | Echo understanding back to user | Confirmation or correction |
| I-3 | Ask clarifying questions | Requirement details |
| I-4 | Document requirements with IDs | Requirements table |
| I-5 | Assign priorities | Prioritized requirements |
| I-6 | Confirm with user | User acknowledgment |

#### 3.2.3 Key Prompts

**Prompt I-A: Initial Request**
```
I need to plan a new component. Here's what I want:
[REQUIREMENT]

Before we start building, I want to go through a structured planning process.
Please start by echoing back your understanding, then ask clarifying questions.
```

**Prompt I-B: Clarification**
```
What information do you need from me to create an implementation plan?
```

#### 3.2.4 Completion Criteria

- [ ] All requirements documented with IDs (R-001, R-002, etc.)
- [ ] Priorities assigned (High/Medium/Low)
- [ ] User has confirmed understanding is correct

### 3.3 Phase II: Technical Discovery

#### 3.3.1 Objective

Understand existing codebase patterns, constraints, and available resources.

#### 3.3.2 Tasks

| Task | Action | Output |
|------|--------|--------|
| II-1 | Examine existing components | Pattern documentation |
| II-2 | Review dependencies | Available resources list |
| II-3 | Identify constraints | Constraint table |
| II-4 | Document applicable patterns | Pattern reference |

#### 3.3.3 Files to Examine

| Priority | File | Purpose |
|----------|------|---------|
| 1 | `package.json` | Dependencies and scripts |
| 2 | `src/components/index.ts` | Component registry |
| 3 | Similar existing components | Patterns to follow |
| 4 | `.cursorrules` | Project constraints |
| 5 | `AGENTS.md` | AI instructions |

#### 3.3.4 Completion Criteria

- [ ] Relevant files examined
- [ ] Constraints documented
- [ ] Patterns identified for reuse

### 3.4 Phase III: Architecture Selection

#### 3.4.1 Objective

Present multiple architectural options with tradeoffs; obtain user selection.

#### 3.4.2 Tasks

| Task | Action | Output |
|------|--------|--------|
| III-1 | Generate minimum 3 options | Options list |
| III-2 | Document pros/cons for each | Tradeoff analysis |
| III-3 | Identify tensions between requirements | Tension documentation |
| III-4 | Present to user | Options presentation |
| III-5 | Record user selection | Selected architecture |
| III-6 | Document rationale | Decision log entry |

#### 3.4.3 Option Presentation Format

```
#### Option [A/B/C]: [Name]

**Description:** [One paragraph]

**Pros:**
- [Advantage 1]
- [Advantage 2]

**Cons:**
- [Disadvantage 1]
- [Disadvantage 2]

**Best When:** [Use case]
```

#### 3.4.4 Completion Criteria

- [ ] Minimum 3 options presented
- [ ] Tradeoffs clearly explained
- [ ] User has selected an option
- [ ] Selection rationale documented

### 3.5 Phase IV: Plan Formulation

#### 3.5.1 Objective

Create a complete implementation plan document.

#### 3.5.2 Tasks

| Task | Action | Output |
|------|--------|--------|
| IV-1 | Create plan document | `.cursor/plans/*.plan.md` |
| IV-2 | Add architecture diagrams | Mermaid diagrams |
| IV-3 | Define file structure | File tree |
| IV-4 | Write component code | Code blocks |
| IV-5 | Document usage examples | Usage section |
| IV-6 | Add security analysis | Security table |
| IV-7 | Define todos | Todo list |

#### 3.5.3 Required Plan Sections

| Section | Required | Purpose |
|---------|----------|---------|
| Overview | Yes | What and why |
| Architecture Diagram | Yes | Visual system view |
| File Structure | Yes | What files to create |
| Data Structures | If applicable | Types/interfaces |
| Component Code | Yes | Implementation |
| Usage Examples | Yes | How to use |
| Security | Yes | Threat analysis |
| Todos | Yes | Implementation steps |

#### 3.5.4 Completion Criteria

- [ ] Plan document created at `.cursor/plans/`
- [ ] All required sections present
- [ ] At least one architecture diagram included
- [ ] Todos defined for implementation

### 3.6 Phase V: Critical Review

#### 3.6.1 Objective

Harshly critique the plan to identify flaws, over-engineering, and requirement gaps.

#### 3.6.2 Tasks

| Task | Action | Output |
|------|--------|--------|
| V-1 | Execute self-critique | Flaw list |
| V-2 | Check requirement alignment | Alignment table |
| V-3 | Evaluate simplicity | Complexity assessment |
| V-4 | Assess security | Security review |
| V-5 | Document all flaws | Flaw table with severity |

#### 3.6.3 Critical Prompts

**PRIMARY CRITIQUE PROMPT (MANDATORY):**
```
Now harshly criticize your plan. Disprove yourself if you can.
```

**ALIGNMENT CHECK PROMPT:**
```
Does this plan align with my original and revised goals?
```

#### 3.6.4 Critique Checklist Categories

1. **Alignment** — Does it address all requirements?
2. **Simplicity** — Could it be simpler?
3. **Scope Creep** — Are we building things not requested?
4. **Security** — What's the attack surface?
5. **Dependencies** — Are we adding unnecessary dependencies?
6. **Maintainability** — Is it easy to update?
7. **User Experience** — Does it handle errors gracefully?

#### 3.6.5 Flaw Severity Classification

| Severity | Definition | Action |
|----------|------------|--------|
| CRITICAL | Violates core requirement or creates security hole | Must fix before approval |
| HIGH | Significant over-engineering or complexity | Should fix |
| MEDIUM | Unnecessary features or abstraction | Consider fixing |
| LOW | Minor improvements possible | Optional |

#### 3.6.6 Completion Criteria

- [ ] Self-critique executed
- [ ] All flaws documented with severity
- [ ] Requirement alignment verified
- [ ] Critical and High severity flaws identified

### 3.7 Phase VI: Plan Revision

#### 3.7.1 Objective

Address all identified flaws; repeat critique if necessary.

#### 3.7.2 Tasks

| Task | Action | Output |
|------|--------|--------|
| VI-1 | Address CRITICAL flaws | Updated plan |
| VI-2 | Address HIGH flaws | Updated plan |
| VI-3 | Document changes made | Change log |
| VI-4 | Execute second critique | Second flaw list |
| VI-5 | Repeat until no CRITICAL/HIGH flaws | Clean critique |

#### 3.7.3 Revision Loop

```
┌─────────────────────────────────────────────────┐
│                REVISION LOOP                     │
├─────────────────────────────────────────────────┤
│                                                  │
│   ┌──────────┐     ┌──────────┐                 │
│   │ Critique │────►│ Flaws?   │                 │
│   └──────────┘     └────┬─────┘                 │
│        ▲                │                        │
│        │           ┌────┴────┐                   │
│        │           ▼         ▼                   │
│        │    ┌──────────┐ ┌──────────┐           │
│        │    │ CRITICAL │ │ None or  │           │
│        │    │ or HIGH  │ │ LOW only │           │
│        │    └────┬─────┘ └────┬─────┘           │
│        │         │            │                  │
│        │         ▼            ▼                  │
│        │    ┌──────────┐ ┌──────────┐           │
│        └────┤  Revise  │ │ Proceed  │           │
│             └──────────┘ └──────────┘           │
│                                                  │
└─────────────────────────────────────────────────┘
```

#### 3.7.4 Second Critique Prompt

```
Now criticize this NEW plan just as harshly. Does it align with my original goals?
```

#### 3.7.5 Completion Criteria

- [ ] All CRITICAL flaws resolved
- [ ] All HIGH flaws resolved or explicitly accepted
- [ ] Second critique completed
- [ ] No new CRITICAL/HIGH flaws found

### 3.8 Phase VII: Final Approval

#### 3.8.1 Objective

Obtain explicit user approval to proceed with implementation.

#### 3.8.2 Tasks

| Task | Action | Output |
|------|--------|--------|
| VII-1 | Present final plan summary | Summary table |
| VII-2 | List all files to be created | File list |
| VII-3 | Summarize key decisions | Decision summary |
| VII-4 | Request user approval | Approval confirmation |
| VII-5 | Record approval | Approval timestamp |

#### 3.8.3 Approval Indicators

User approval is indicated by:

- Explicit statement: "approved", "looks good", "let's build it"
- Mode switch to Agent mode
- Instruction to proceed with implementation

#### 3.8.4 Completion Criteria

- [ ] Final summary presented
- [ ] User has explicitly approved
- [ ] Plan document finalized
- [ ] Ready for implementation

---

## 4. ADMINISTRATION AND LOGISTICS

### 4.1 File Organization

```
_planning/
├── BRIEFING.md                    # This document
├── OPERATIONS_MANUAL.md           # Detailed procedures
├── README.md                      # Quick start guide
├── templates/
│   ├── SESSION_TEMPLATE.md        # Copy for each session
│   ├── PROMPTS.md                 # Reusable prompts
│   ├── CRITIQUE_CHECKLIST.md      # Evaluation criteria
│   └── PLAN_TEMPLATE.md           # Final plan structure
└── sessions/
    └── YYYY-MM-DD_component.md    # Completed sessions
```

### 4.2 Naming Conventions

| Item | Format | Example |
|------|--------|---------|
| Session file | `YYYY-MM-DD_component-name.md` | `2025-12-13_trade-widget.md` |
| Plan file | `component_name_[hash].plan.md` | `trade_widget_b150735e.plan.md` |
| Requirement ID | `R-XXX` | `R-001` |
| Flaw ID | `F-XXX` | `F-001` |
| Decision ID | `D-XXX` | `D-001` |

### 4.3 Document Retention

| Document Type | Retention | Location |
|---------------|-----------|----------|
| Session records | Permanent | `_planning/sessions/` |
| Plan documents | Permanent | `.cursor/plans/` |
| Process documentation | Permanent | `_docs/` |

### 4.4 Version Control

All planning documents should be committed to version control with descriptive messages:

```bash
git add _planning/
git commit -m "docs: add planning session for [component-name]"
```

---

## 5. COMMAND AND SIGNAL

### 5.1 Roles and Responsibilities

| Role | Responsibilities |
|------|------------------|
| **User** | Provide requirements, make decisions, approve plans |
| **AI Assistant** | Execute process, generate options, self-critique |
| **Developer** | Implement approved plans |

### 5.2 Communication Protocol

#### 5.2.1 User-to-AI

- Clear requirement statements
- Explicit decisions when options presented
- Approval/rejection of plans

#### 5.2.2 AI-to-User

- Echo understanding before proceeding
- Present options with tradeoffs
- Request explicit approval at gates

### 5.3 Decision Gates

| Gate | Location | Requires |
|------|----------|----------|
| G1 | End of Phase I | User confirms requirements |
| G2 | End of Phase III | User selects architecture |
| G3 | End of Phase V | Critique completed |
| G4 | End of Phase VII | User approves implementation |

### 5.4 Escalation

If process cannot continue due to:

- Conflicting requirements → Present tension to user
- Missing information → Request clarification
- Technical impossibility → Explain constraints, propose alternatives

---

## ANNEXES

### Annex A: Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│              COMPONENT PLANNING QUICK REFERENCE              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  PHASE I:   Gather requirements, confirm understanding      │
│  PHASE II:  Examine codebase, identify constraints          │
│  PHASE III: Present 3+ options, get user selection          │
│  PHASE IV:  Create plan document with diagrams              │
│  PHASE V:   "Harshly criticize your plan"                   │
│  PHASE VI:  Fix flaws, re-critique                          │
│  PHASE VII: Get explicit approval                           │
│                                                              │
│  KEY PROMPT: "Now harshly criticize your plan.              │
│               Disprove yourself if you can."                │
│                                                              │
│  OUTPUTS:                                                    │
│    • .cursor/plans/*.plan.md                                │
│    • _planning/sessions/YYYY-MM-DD_*.md                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Annex B: Checklist - Before Starting

- [ ] User has stated initial requirement
- [ ] Session template copied to `sessions/`
- [ ] AI is in Plan mode (not Agent mode)
- [ ] Codebase is accessible for examination

### Annex C: Checklist - Before Approving

- [ ] All requirements addressed (R-XXX)
- [ ] Minimum 2 critique rounds completed
- [ ] No CRITICAL or HIGH flaws remain
- [ ] All decisions documented (D-XXX)
- [ ] Plan document exists at `.cursor/plans/`
- [ ] User has explicitly approved

---

## AUTHENTICATION

This briefing document is approved for distribution and use.

| Role | Status |
|------|--------|
| Process Owner | Approved |
| Documentation | Complete |
| Distribution | Authorized |

---

**END OF BRIEFING**
