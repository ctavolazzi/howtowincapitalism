# Plan Critique Checklist

Use this checklist to critically evaluate any component plan.

---

## 1. Alignment with Requirements

| Check | Question | Status |
|-------|----------|--------|
| 1.1 | Does the plan address ALL stated requirements? | [ ] |
| 1.2 | Are any requirements partially addressed? Which ones? | [ ] |
| 1.3 | Are any requirements completely ignored? | [ ] |
| 1.4 | Does the plan add features the user didn't ask for? | [ ] |

**Notes:**

---

## 2. Simplicity

| Check | Question | Status |
|-------|----------|--------|
| 2.1 | Could this be done with fewer files? | [ ] |
| 2.2 | Are there unnecessary abstractions? | [ ] |
| 2.3 | Is there TypeScript/typing that adds no value? | [ ] |
| 2.4 | Are there helper functions that could be inline? | [ ] |
| 2.5 | Is there a "dumber" way to achieve the same result? | [ ] |

**Notes:**

---

## 3. Scope Creep

| Check | Question | Status |
|-------|----------|--------|
| 3.1 | Are we building features for "later" that aren't needed now? | [ ] |
| 3.2 | Are there multiple modes/variants when one would suffice? | [ ] |
| 3.3 | Is there configuration that could be hardcoded? | [ ] |
| 3.4 | Are we solving problems that don't exist yet? | [ ] |

**Notes:**

---

## 4. Security

| Check | Question | Status |
|-------|----------|--------|
| 4.1 | What is the attack surface? | [ ] |
| 4.2 | Is user input being stored? Should it be? | [ ] |
| 4.3 | Is there a simpler approach with less attack surface? | [ ] |
| 4.4 | Are we relying on "security through obscurity"? | [ ] |
| 4.5 | What happens if this component is abused? | [ ] |

**Notes:**

---

## 5. Dependencies

| Check | Question | Status |
|-------|----------|--------|
| 5.1 | Are we adding new external dependencies? | [ ] |
| 5.2 | Could we use existing dependencies instead? | [ ] |
| 5.3 | What happens if a dependency goes down? | [ ] |
| 5.4 | Is the dependency appropriate for the use case? | [ ] |

**Notes:**

---

## 6. Maintainability

| Check | Question | Status |
|-------|----------|--------|
| 6.1 | Is the update workflow clear and simple? | [ ] |
| 6.2 | How many files need to change to update X? | [ ] |
| 6.3 | Is documentation included? | [ ] |
| 6.4 | Will future-me understand this in 6 months? | [ ] |

**Notes:**

---

## 7. User Experience

| Check | Question | Status |
|-------|----------|--------|
| 7.1 | What happens if the component fails to load? | [ ] |
| 7.2 | Is there a loading state? | [ ] |
| 7.3 | Is the component accessible? | [ ] |
| 7.4 | Does it work on mobile? | [ ] |

**Notes:**

---

## 8. Honest Assessment

### What's Good About This Plan?

1.
2.
3.

### What's Bad About This Plan?

1.
2.
3.

### What's Missing?

1.
2.

### Final Verdict

- [ ] **Approve as-is** - Plan is solid
- [ ] **Minor revisions needed** - Small tweaks required
- [ ] **Major revisions needed** - Significant flaws to address
- [ ] **Start over** - Fundamental approach is wrong

---

## Revision Actions

If revisions are needed, list specific actions:

| Priority | Action | Addresses Flaw |
|----------|--------|----------------|
| 1 | | |
| 2 | | |
| 3 | | |
