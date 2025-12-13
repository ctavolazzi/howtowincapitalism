# Component Planning Session: TradeWidget

## Session Information

| Field | Value |
|-------|-------|
| Date | 2025-12-13 |
| Component Name | TradeWidget |
| Session ID | 20251213-001 |
| Status | [x] Complete |

---

## Phase I: Requirements Gathering

### 1.1 Initial Request

> "I need a component that is completely independent from all other components as much as possible. I need it to work by allowing people to offer me something to trade for what I have to offer. Remember the One Red Paperclip guy? I want to do that, but I want to do it by offering something for trade at all times and having that item linked through this component anywhere I put it, and have ALL components update in real time across any and all sites they are on when I update what I have for trade."

### 1.2 Extracted Requirements

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| R-001 | Component independence | High | Should work anywhere |
| R-002 | Accept trade offers | High | Core functionality |
| R-003 | Single source of truth | High | One place to update |
| R-004 | Real-time sync across sites | High | All widgets update together |
| R-005 | Embeddable anywhere | Medium | External sites too |
| R-006 | Multiple display modes | Medium | Banner, floating, inline |

### 1.3 Clarifying Questions Asked

| Question | User Response |
|----------|---------------|
| What data to display? | Item name, description, photo, trade history |
| What to collect from offers? | Offer description + email |
| How to be notified? | Email |
| Display modes? | Banner, floating, inline |
| Email to use? | porchroot@gmail.com |

### 1.4 Requirements Confirmed

- [x] All requirements documented
- [x] Priorities assigned
- [x] Ambiguities resolved

---

## Phase II: Technical Discovery

### 2.1 Codebase Files Examined

| File | Purpose | Key Findings |
|------|---------|--------------|
| package.json | Dependencies | Astro 5.x, Cloudflare, nanostores, Resend |
| src/components/index.ts | Registry | Atomic design, barrel exports |
| src/components/atoms/WikiBox.astro | Base atom | BEM naming, CSS vars, slots |
| src/components/molecules/CallToAction.astro | Similar component | URL sanitization |
| src/lib/auth/turnstile.ts | Bot protection | Already configured |

### 2.2 Technical Constraints

| Constraint | Source | Impact on Design |
|------------|--------|------------------|
| No React/Vue/Svelte | .cursorrules | Use vanilla JS or Web Components |
| Use CSS variables | .cursorrules | Must use --color-* pattern |
| Cloudflare hosting | package.json | KV available but ties to site |
| BEM naming | Existing components | Follow wiki-box pattern |

### 2.3 Existing Patterns to Follow

| Pattern | Example File | How to Apply |
|---------|--------------|--------------|
| WikiBox atom | WikiBox.astro | Could extend, but not necessary |
| Web Components | UserMenu.astro | Use for client-side fetch |
| CSS scoping | CallToAction.astro | Scoped styles in component |

### 2.4 Discovery Complete

- [x] Relevant files examined
- [x] Constraints documented
- [x] Patterns identified

---

## Phase III: Architecture Selection

### 3.1 Options Presented

#### Option A: Cloudflare KV Backend

**Description:** Store data in Cloudflare KV, serve via API routes

**Pros:**
- Uses existing infrastructure
- Already set up

**Cons:**
- Ties to howtowincapitalism.com as source of truth
- If site down, all widgets break

#### Option B: External Service (Firebase/Supabase)

**Description:** Use external database with real-time sync

**Pros:**
- Truly decoupled
- Real-time built-in

**Cons:**
- External dependency
- May cost money

#### Option C: GitHub Raw File

**Description:** JSON file in GitHub repo, widgets fetch from raw URL

**Pros:**
- Free, reliable
- User already uses GitHub
- Easy to update (just edit file)

**Cons:**
- ~5 min cache delay (not instant real-time)
- Requires JavaScript fetch

#### Option D: Mailto Only (No Sync)

**Description:** Hardcoded data, mailto link

**Pros:**
- Zero attack surface
- Dumbest possible

**Cons:**
- No sync across sites
- Update each site manually

### 3.2 User Selection

**Selected Option:** C (GitHub Raw File)

**Rationale:** User wanted simplicity and security, but also sync across sites. GitHub provides free, reliable hosting with no backend to maintain. The ~5 min delay is acceptable.

**Repository Name:** `open-shelf` (chosen to allow future growth - books, etc.)

### 3.3 Architecture Confirmed

- [x] Options presented
- [x] Tradeoffs explained
- [x] User decision recorded

---

## Phase IV: Plan Formulation

### 4.1 Plan Document Created

**Location:** `.cursor/plans/trade_widget_component_b150735e.plan.md`

### 4.2 Plan Contents

- [x] Architecture diagram (3 mermaid diagrams)
- [x] File structure
- [x] Data structures (JSON schema)
- [x] Component code (full TradeWidget.astro)
- [x] Usage examples
- [x] Security considerations

### 4.3 Plan Ready for Review

- [x] Plan document complete
- [x] All sections filled

---

## Phase V: Critical Review

### 5.1 Self-Critique Prompt Used

> "Now harshly criticize your plan. Disprove yourself if you can."

### 5.2 Flaws Identified (First Plan)

| Flaw ID | Description | Severity | Resolution |
|---------|-------------|----------|------------|
| F-001 | 5 files when 1 would suffice | High | Collapsed to 1 file |
| F-002 | TypeScript interfaces for simple data | Low | Removed |
| F-003 | Email obfuscation is security theater | Low | Removed |
| F-004 | Trade history useless for Trade #1 | Low | Deferred |
| F-005 | 3 modes is scope creep | Medium | Reduced to 2 |
| F-006 | Sub-components unnecessary | Medium | Inlined |

### 5.3 Second Critique

> "Now criticize this NEW plan just as harshly. Does it align with my original goals?"

### 5.4 Critical Flaw Found

| Flaw ID | Description | Severity | Resolution |
|---------|-------------|----------|------------|
| F-007 | Hardcoded data abandons sync requirement | Critical | Changed to GitHub fetch |

**Analysis:** The "dumb simple" revision with hardcoded data violated the user's core requirement of cross-site sync. This was caught during second critique.

### 5.5 Alignment Check

| Original Requirement | Plan Addresses It? | Notes |
|---------------------|-------------------|-------|
| R-001: Independence | [x] Yes | Fetches from external source |
| R-002: Accept offers | [x] Yes | Mailto link |
| R-003: Single source | [x] Yes | GitHub JSON file |
| R-004: Real-time sync | [x] Partial | ~5 min delay, acceptable |
| R-005: Embeddable | [x] Yes | Works anywhere |
| R-006: Display modes | [x] Partial | 2 of 3 modes (floating deferred) |

### 5.6 Critique Complete

- [x] Self-critique performed
- [x] Flaws documented
- [x] Alignment verified

---

## Phase VI: Plan Revision

### 6.1 Changes Made

| Change | Reason |
|--------|--------|
| Collapsed 5 files to 1 | Over-engineered |
| Changed hardcoded to GitHub fetch | Restore sync requirement |
| Removed TypeScript interfaces | Unnecessary complexity |
| Deferred floating mode | Requires more JS |
| Added mermaid diagrams | User requested |

### 6.2 Second Critique Passed

After adding GitHub fetch approach, plan aligned with all requirements.

### 6.3 Revision Complete

- [x] Flaws addressed
- [x] Plan updated
- [x] Re-critique passed

---

## Phase VII: Final Approval

### 7.1 Final Plan Summary

**Architecture:** GitHub raw file as data source, Web Component for fetch, mailto for offers

**Files to Create:**
- `ctavolazzi/open-shelf` repo with `trade/current.json`
- `src/components/trade/TradeWidget.astro`
- Export in `src/components/index.ts`
- Architecture docs in `_docs/`

**Key Decisions:**
- GitHub over Cloudflare KV (decoupled)
- Mailto over form (zero attack surface)
- 2 modes over 3 (simpler MVP)
- Web Component for fetch (vanilla JS)

### 7.2 User Approval

- [x] User reviewed final plan
- [x] User approved for implementation
- [x] Mode switched to Agent

### 7.3 Implementation Ready

- [x] Plan document finalized
- [x] All todos defined
- [x] Ready to build

---

## Decision Log

| ID | Decision | Rationale | Alternatives Rejected |
|----|----------|-----------|----------------------|
| D-001 | Mailto for offers | Zero attack surface | Form + Resend |
| D-002 | GitHub raw file | Free, reliable, decoupled | Cloudflare KV, Firebase |
| D-003 | Web Component | Vanilla JS, works in Astro | Nanostores, server fetch |
| D-004 | Defer floating mode | Requires toggle JS | Build all 3 now |
| D-005 | No images initially | User doesn't have photo | Require image |
| D-006 | porchroot@gmail.com | User's choice | Alias service |
| D-007 | Repo name "open-shelf" | Future growth | "trade-data" |

---

## Session Notes

### Key Learnings

1. **Self-critique is essential** - First plan was over-engineered, second plan broke requirements. Both caught by critique.

2. **Tension identification** - User wanted "dumb simple" AND "sync across sites" - these are in tension. Naming the tension led to resolution.

3. **Progressive refinement** - Started complex, simplified, found critical flaw, added back minimal complexity.

4. **Repository naming** - Thinking about future use cases (books, resources) led to better naming than component-specific name.

### Process Improvements

- Could have identified the "sync vs simplicity" tension earlier
- Should present architecture tradeoffs more clearly upfront
- Critique prompt is powerful - use it twice

### Time Spent

- Requirements gathering: ~15 min
- Technical discovery: ~10 min
- Architecture selection: ~20 min (multiple rounds)
- Plan formulation: ~15 min
- Critique and revision: ~20 min (2 rounds)
- **Total: ~80 min**

### Resulting Artifacts

1. `.cursor/plans/trade_widget_component_b150735e.plan.md` - Final plan
2. `_docs/COMPONENT_PLANNING_PROCESS.md` - Process documentation
3. `_planning/` folder - Reusable templates
