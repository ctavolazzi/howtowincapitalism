# Planning Phase Prompts

Reusable prompts for each phase of the component planning process.

---

## Phase I: Requirements Gathering

### Prompt 1.1: Initial Request

Use this to start a new component planning session:

```
I need to plan a new component. Here's what I want:

[Describe what you want the component to do]

Before we start building, I want to go through a structured planning process:
1. Gather requirements
2. Explore technical constraints
3. Consider architecture options
4. Create a plan
5. Critique the plan
6. Revise as needed

Please start by echoing back your understanding of what I'm asking for, then ask me clarifying questions.
```

### Prompt 1.2: Clarification Request

If the AI doesn't ask enough questions:

```
What information do you need from me to create an implementation plan for this component?
```

### Prompt 1.3: Simplicity Constraint

To set expectations for simplicity:

```
I want this to be as simple and secure as possible. Don't overthink it. What's the dumbest, simplest, most safe way to do this?
```

---

## Phase II: Technical Discovery

### Prompt 2.1: Codebase Review

If AI hasn't examined the codebase:

```
Before proposing a solution, please examine my existing codebase patterns. Look at:
- How existing components are structured
- What CSS variables and naming conventions are used
- What dependencies are already available
```

### Prompt 2.2: Constraint Identification

To ensure constraints are identified:

```
What technical constraints should we consider based on my project setup and existing code?
```

---

## Phase III: Architecture Selection

### Prompt 3.1: Options Request

To get multiple options:

```
What are the different ways we could implement this? Give me at least 3 options with pros and cons.
```

### Prompt 3.2: Tradeoff Clarity

If tradeoffs aren't clear:

```
What are the tradeoffs between these options? What am I giving up with each choice?
```

### Prompt 3.3: Security Focus

To prioritize security:

```
I don't know enough about security to design this myself. Which option is the most secure? What attack surface does each option have?
```

---

## Phase IV: Plan Formulation

### Prompt 4.1: Plan Request

To request a formal plan:

```
Create a detailed implementation plan using modern design principles, clean code, and sensible data structures. Include architecture diagrams.
```

### Prompt 4.2: Documentation Request

To ensure documentation:

```
Don't forget to include architecture diagrams and to put them in the plan and the project documentation.
```

---

## Phase V: Critical Review

### Prompt 5.1: Self-Critique (Primary)

The most important prompt in the process:

```
Now harshly criticize your plan. Disprove yourself if you can.
```

### Prompt 5.2: Alignment Check

After critique:

```
Now criticize this NEW plan just as harshly. Does it align with my original and revised goals?
```

### Prompt 5.3: Over-Engineering Check

To catch scope creep:

```
Is this over-engineered? What can we remove and still meet the core requirements?
```

---

## Phase VI: Plan Revision

### Prompt 6.1: Revision Request

After critique identifies flaws:

```
Revise your plan to address these flaws. Keep it simple.
```

### Prompt 6.2: Tension Resolution

If requirements conflict:

```
You've identified a tension between [X] and [Y]. Which should I prioritize? What do I lose with each choice?
```

---

## Phase VII: Final Approval

### Prompt 7.1: Summary Request

Before approving:

```
Summarize the final plan in a simple table. What are we building, what files, what's the architecture?
```

### Prompt 7.2: Implementation Start

To begin building:

```
The plan is approved. Let's build it.
```

---

## Utility Prompts

### Redirect to Simplicity

If things get too complex:

```
Don't overthink it. What's the dummiest simplest most safe way to do this with all vanilla code and zero microservices?
```

### Future-Proofing Without Over-Engineering

To consider growth without building it now:

```
Let's design this so it can grow over time, but only build what we need now.
```

### Documentation Generation

After planning is complete:

```
Create a document that explains the exact process we just took step by step, with a naming structure like a legal document.
```
