# Component Library

> Complete documentation for all Astro components
>
> Last Updated: 2025-12-14

---

## Table of Contents

1. [Overview](#overview)
2. [Atomic Design Pattern](#atomic-design-pattern)
3. [Atoms](#atoms)
4. [Molecules](#molecules)
5. [Organisms](#organisms)
6. [Auth Components](#auth-components)
7. [Guard Components](#guard-components)
8. [Utility Components](#utility-components)
9. [Creating Components](#creating-components)
10. [Design Tokens](#design-tokens)

---

## Overview

The component library follows the **Atomic Design** methodology, organizing components by complexity level. All components are built with Astro and styled using CSS custom properties.

### Component Count

| Category | Count | Location |
|----------|-------|----------|
| Atoms | 5 | `src/components/atoms/` |
| Molecules | 12 | `src/components/molecules/` |
| Organisms | 8 | `src/components/organisms/` |
| Auth | 5 | `src/components/auth/` |
| Guards | 1 | `src/components/guards/` |
| Utilities | 3 | `src/components/utilities/` |
| Simple | 4 | `src/components/simple/` |
| Trade | 1 | `src/components/trade/` |
| Search | 1 | `src/components/search/` |
| **Total** | **40** | |

---

## Atomic Design Pattern

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              PAGES                                          │
│   Complete pages built from organisms                                       │
│   Example: login.astro, profile/index.astro                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                            ORGANISMS                                         │
│   Complex UI sections composed of molecules and atoms                       │
│   Example: PageHeader, Footer, ProfileForm                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                            MOLECULES                                         │
│   Functional UI groups that combine atoms                                   │
│   Example: LoginForm, DecisionMatrix, InfoBox                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                              ATOMS                                           │
│   Basic building blocks - single purpose, highly reusable                   │
│   Example: WikiBox, Avatar, RoleBadge                                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Atoms

Base building blocks that can't be broken down further.

### WikiBox

**File:** `src/components/atoms/WikiBox.astro`

The foundational container component. All box-style components extend WikiBox.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'warning' \| 'info' \| 'sidebar' \| 'nav' \| 'cta'` | `'default'` | Visual style |
| `title` | `string` | - | Optional header title |
| `class` | `string` | - | Additional CSS classes |
| `id` | `string` | - | HTML id attribute |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Internal padding |

**Slots:**

| Slot | Description |
|------|-------------|
| default | Main content |
| `header-icon` | Icon before title |
| `header-actions` | Actions after title |
| `footer` | Footer content |

**Usage:**

```astro
---
import WikiBox from '../atoms/WikiBox.astro';
---

<WikiBox variant="info" title="Information">
  <p>Box content here</p>
</WikiBox>

<!-- With slots -->
<WikiBox variant="warning" title="Warning">
  <span slot="header-icon">⚠️</span>
  <p>Warning content</p>
  <div slot="footer">Footer actions</div>
</WikiBox>
```

**Variants:**

| Variant | Use Case |
|---------|----------|
| `default` | General content containers |
| `warning` | Warnings, disclaimers |
| `info` | Informational callouts |
| `sidebar` | Sidebar content |
| `nav` | Navigation boxes |
| `cta` | Call-to-action sections |

---

### Avatar

**File:** `src/components/atoms/Avatar.astro`

Displays a user avatar with fallback to initials.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | - | Image URL |
| `name` | `string` | - | User name (for fallback initials) |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Avatar size |

**Usage:**

```astro
---
import Avatar from '../atoms/Avatar.astro';
---

<Avatar src="/avatars/user.jpg" name="John Doe" size="lg" />

<!-- Fallback to initials -->
<Avatar name="John Doe" />
```

---

### RoleBadge

**File:** `src/components/atoms/RoleBadge.astro`

Displays a user role indicator.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `role` | `'admin' \| 'editor' \| 'contributor' \| 'viewer'` | Required | User role |

**Usage:**

```astro
---
import RoleBadge from '../atoms/RoleBadge.astro';
---

<RoleBadge role="admin" />
<RoleBadge role="editor" />
```

---

### Breadcrumbs

**File:** `src/components/atoms/Breadcrumbs.astro`

Navigation breadcrumb trail.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `Array<{label: string, href?: string}>` | Required | Breadcrumb items |

**Usage:**

```astro
---
import Breadcrumbs from '../atoms/Breadcrumbs.astro';
---

<Breadcrumbs items={[
  { label: 'Home', href: '/' },
  { label: 'Notes', href: '/notes/' },
  { label: 'Current Page' }
]} />
```

---

### Collapsible

**File:** `src/components/atoms/Collapsible.astro`

Expandable/collapsible section.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | Required | Section title |
| `open` | `boolean` | `false` | Initially expanded |

**Usage:**

```astro
---
import Collapsible from '../atoms/Collapsible.astro';
---

<Collapsible title="Click to expand">
  Hidden content revealed when expanded.
</Collapsible>

<Collapsible title="Already open" open>
  This section starts expanded.
</Collapsible>
```

---

## Molecules

Composed components that combine atoms for specific functionality.

### DecisionMatrix

**File:** `src/components/molecules/DecisionMatrix.astro`

Renders decision matrix analysis results in a Wikipedia-style table.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `result` | `DecisionResultData` | Required | Decision analysis result |
| `title` | `string` | `'Decision Analysis'` | Section title |
| `showBreakdown` | `boolean` | `true` | Show detailed breakdown |
| `class` | `string` | - | Additional CSS classes |

**Usage:**

```astro
---
import DecisionMatrix from '../molecules/DecisionMatrix.astro';
import { makeDecision } from '../../lib/tools';

const result = makeDecision({
  options: ['Option A', 'Option B', 'Option C'],
  criteria: ['Cost', 'Speed', 'Quality'],
  scores: {
    'Option A': [7, 8, 6],
    'Option B': [9, 5, 7],
    'Option C': [6, 9, 8]
  },
  weights: [0.3, 0.2, 0.5]
});
---

<DecisionMatrix result={result} title="Comparison" />
```

---

### InfoBox

**File:** `src/components/molecules/InfoBox.astro`

Information callout box. Extends WikiBox with info styling.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | Box title |

**Usage:**

```astro
---
import InfoBox from '../molecules/InfoBox.astro';
---

<InfoBox title="Did you know?">
  Interesting information here.
</InfoBox>
```

---

### NoteBox

**File:** `src/components/molecules/NoteBox.astro`

Note callout box for tips and notes.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `'Note'` | Box title |

**Usage:**

```astro
---
import NoteBox from '../molecules/NoteBox.astro';
---

<NoteBox>
  This is important to remember.
</NoteBox>
```

---

### Disclaimer

**File:** `src/components/molecules/Disclaimer.astro`

Warning disclaimer banner, closable by user.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `'Disclaimer'` | Banner title |
| `closable` | `boolean` | `true` | Allow dismissal |

**Usage:**

```astro
---
import Disclaimer from '../molecules/Disclaimer.astro';
---

<Disclaimer title="Important">
  This site is for educational purposes only.
</Disclaimer>
```

---

### FAQ

**File:** `src/components/molecules/FAQ.astro`

Accordion-style FAQ section.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `Array<{question: string, answer: string}>` | Required | Q&A pairs |

**Usage:**

```astro
---
import FAQ from '../molecules/FAQ.astro';
---

<FAQ items={[
  { question: 'What is this?', answer: 'A wiki about financial autonomy.' },
  { question: 'Who is it for?', answer: 'Anyone interested in personal finance.' }
]} />
```

---

### TopicCard

**File:** `src/components/molecules/TopicCard.astro`

Content preview card for topic listings.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | Required | Card title |
| `description` | `string` | - | Short description |
| `href` | `string` | Required | Link destination |
| `icon` | `string` | - | Optional icon |

**Usage:**

```astro
---
import TopicCard from '../molecules/TopicCard.astro';
---

<TopicCard
  title="Getting Started"
  description="Learn the basics"
  href="/notes/getting-started/"
  icon="📚"
/>
```

---

### SeeAlso

**File:** `src/components/molecules/SeeAlso.astro`

Related content links section.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `links` | `Array<{label: string, href: string}>` | Required | Related links |

**Usage:**

```astro
---
import SeeAlso from '../molecules/SeeAlso.astro';
---

<SeeAlso links={[
  { label: 'Related Topic', href: '/notes/related/' },
  { label: 'Another Topic', href: '/notes/another/' }
]} />
```

---

### BlankSlate

**File:** `src/components/molecules/BlankSlate.astro`

Empty state / onboarding component.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | Required | Headline |
| `description` | `string` | - | Description text |
| `icon` | `string` | - | Optional icon |

**Slots:**

| Slot | Description |
|------|-------------|
| default | Action buttons/content |

**Usage:**

```astro
---
import BlankSlate from '../molecules/BlankSlate.astro';
---

<BlankSlate
  title="No items yet"
  description="Get started by creating your first item."
  icon="📝"
>
  <a href="/create">Create Item</a>
</BlankSlate>
```

---

### CompletenessMeter

**File:** `src/components/molecules/CompletenessMeter.astro`

Progress indicator for content completeness.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `percentage` | `number` | Required | 0-100 |
| `label` | `string` | - | Optional label |

**Usage:**

```astro
---
import CompletenessMeter from '../molecules/CompletenessMeter.astro';
---

<CompletenessMeter percentage={75} label="Profile complete" />
```

---

### CallToAction

**File:** `src/components/molecules/CallToAction.astro`

Call-to-action section with button.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | Required | CTA headline |
| `description` | `string` | - | Supporting text |
| `buttonText` | `string` | Required | Button label |
| `href` | `string` | Required | Button destination |

**Usage:**

```astro
---
import CallToAction from '../molecules/CallToAction.astro';
---

<CallToAction
  title="Ready to get started?"
  description="Join thousands of users."
  buttonText="Sign Up"
  href="/register/"
/>
```

---

## Organisms

Complex sections composed of molecules and atoms.

### PageHeader

**File:** `src/components/organisms/PageHeader.astro`

Page title header with optional metadata.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | Required | Page title |
| `description` | `string` | - | Subtitle/description |

**Usage:**

```astro
---
import PageHeader from '../organisms/PageHeader.astro';
---

<PageHeader
  title="Page Title"
  description="Optional description"
/>
```

---

### Footer

**File:** `src/components/organisms/Footer.astro`

Site-wide footer component.

**Usage:**

```astro
---
import Footer from '../organisms/Footer.astro';
---

<Footer />
```

---

### Hero

**File:** `src/components/organisms/Hero.astro`

Hero section for landing pages.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | Required | Main headline |
| `subtitle` | `string` | - | Supporting text |

**Slots:**

| Slot | Description |
|------|-------------|
| default | Hero actions/buttons |

**Usage:**

```astro
---
import Hero from '../organisms/Hero.astro';
---

<Hero title="Welcome" subtitle="Get started today">
  <a href="/register">Sign Up</a>
</Hero>
```

---

### Profile Components

Located in `src/components/organisms/profile/`:

| Component | Purpose |
|-----------|---------|
| `ProfileHeader.astro` | User profile header with avatar and name |
| `ProfileForm.astro` | Profile edit form |
| `ActivityFeed.astro` | User activity timeline |
| `SystemBulletin.astro` | System announcements |

---

## Auth Components

Authentication-related components in `src/components/auth/`:

### LoginForm

**File:** `src/components/auth/LoginForm.astro`

Complete login form with validation.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `csrfToken` | `string` | - | CSRF token (production) |
| `redirectTo` | `string` | `'/'` | Post-login redirect |

**Usage:**

```astro
---
import LoginForm from '../auth/LoginForm.astro';
---

<LoginForm csrfToken={csrfToken} redirectTo="/dashboard/" />
```

---

### RegisterForm

**File:** `src/components/auth/RegisterForm.astro`

Registration form with validation and CAPTCHA.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `csrfToken` | `string` | - | CSRF token |
| `turnstileSiteKey` | `string` | - | Cloudflare Turnstile key |

---

### UserMenu

**File:** `src/components/auth/UserMenu.astro`

Header user dropdown menu showing current user.

**Usage:**

```astro
---
import UserMenu from '../auth/UserMenu.astro';
---

<UserMenu />
```

---

### ForgotPasswordForm / ResetPasswordForm

Password recovery forms with validation.

---

## Guard Components

### OwnerGuard

**File:** `src/components/guards/OwnerGuard.astro`

Client-side permission guard. Shows content only to owners/admins.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `ownerId` | `string` | Required | Resource owner ID |
| `visibility` | `'public' \| 'private'` | `'public'` | Resource visibility |

**Slots:**

| Slot | Description |
|------|-------------|
| default | Protected content |
| `controls` | Owner-only controls (edit, delete) |

**Usage:**

```astro
---
import OwnerGuard from '../guards/OwnerGuard.astro';
---

<OwnerGuard ownerId={post.authorId} visibility="private">
  <button slot="controls">Edit</button>
  <article>Protected content</article>
</OwnerGuard>
```

**Note:** This is client-side UI protection only. Server-side validation is required for actual security.

---

## Utility Components

### CardGrid

**File:** `src/components/utilities/CardGrid.astro`

Responsive grid layout for cards.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `number` | `3` | Grid columns |
| `gap` | `'sm' \| 'md' \| 'lg'` | `'md'` | Gap between cards |

**Usage:**

```astro
---
import CardGrid from '../utilities/CardGrid.astro';
import TopicCard from '../molecules/TopicCard.astro';
---

<CardGrid columns={3}>
  <TopicCard title="Card 1" href="/1/" />
  <TopicCard title="Card 2" href="/2/" />
  <TopicCard title="Card 3" href="/3/" />
</CardGrid>
```

---

### Empty

**File:** `src/components/utilities/Empty.astro`

Empty placeholder component for disabling Starlight defaults.

**Usage:**

Used in `astro.config.mjs` to disable built-in components:

```javascript
components: {
  ThemeSelect: './src/components/utilities/Empty.astro',
}
```

---

## Creating Components

### Component Template

```astro
---
/**
 * COMPONENT_NAME - LEVEL (ATOM/MOLECULE/ORGANISM)
 *
 * Description of what this component does.
 *
 * Design Patterns:
 * - Pattern 1: Description
 * - Pattern 2: Description
 */

export interface Props {
  requiredProp: string;
  optionalProp?: string;
  variant?: 'default' | 'alternate';
}

const {
  requiredProp,
  optionalProp = 'default value',
  variant = 'default'
} = Astro.props;
---

<div class={`component component--${variant}`}>
  <slot />
</div>

<style>
  .component {
    /* Use design tokens */
    padding: var(--space-md);
    border: var(--border-width) solid var(--color-border);
  }

  .component--alternate {
    background: var(--color-surface);
  }
</style>
```

### Component Checklist

- [ ] Props interface defined
- [ ] Default values for optional props
- [ ] JSDoc comment with description
- [ ] Scoped styles using CSS custom properties
- [ ] Slots for customization where needed
- [ ] Exported from `src/components/index.ts`

---

## Design Tokens

All components use CSS custom properties from `src/styles/custom.css`:

### Spacing

```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 12px;
--space-lg: 16px;
--space-xl: 24px;
--space-2xl: 32px;
```

### Colors

```css
--color-bg: #ffffff;
--color-text: #202122;
--color-link: #0645ad;
--color-border: #a2a9b1;
--color-surface: #f8f9fa;
--color-warning-bg: #fff9e6;
--color-info-bg: #eaf3ff;
```

### Typography

```css
--font-sans: system-ui, -apple-system, sans-serif;
--font-serif: Georgia, 'Times New Roman', serif;
--font-mono: 'SF Mono', Monaco, Consolas, monospace;
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
```

### Border

```css
--border-width: 1px;
--border-radius: 0; /* Wikipedia aesthetic - no rounded corners */
```

---

## Related Documentation

- [Architecture](./ARCHITECTURE.md) - System architecture
- [DEVELOPERS.md](/DEVELOPERS.md) - Development guide
