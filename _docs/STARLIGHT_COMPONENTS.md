# Starlight Components Reference

Quick reference for using Starlight's built-in components in this project.

## Import Statement

```mdx
import { Tabs, TabItem, Steps, Aside, Badge, Card, CardGrid, LinkCard } from '@astrojs/starlight/components';
```

## Components Used in This Project

### Tabs (for A/B Comparisons)

Best for side-by-side comparisons where users want to see both options.

```mdx
<Tabs>
  <TabItem label="Option A">
    Content for option A...
  </TabItem>
  <TabItem label="Option B">
    Content for option B...
  </TabItem>
</Tabs>
```

**Used in:**
- `debt-strategies.mdx` — Avalanche vs Snowball methods
- `rent-vs-buy.mdx` — Buy vs Rent criteria

### Steps (for Numbered Procedures)

Visual distinction for ordered steps. Creates a vertical timeline effect.

```mdx
<Steps>
1. First step description
2. Second step description
3. Third step description
</Steps>
```

**Used in:**
- `debt-strategies.mdx` — Payment order, debt-free milestone steps
- `rent-vs-buy.mdx` — Analysis steps

### Aside (for Callouts/Warnings)

Styled callout boxes for tips, notes, cautions, and dangers.

**Types:** `note` (blue), `tip` (green), `caution` (yellow), `danger` (red)

```mdx
<Aside type="caution" title="Warning Title">
Warning content here...
</Aside>

<Aside type="tip" title="Pro Tip">
Helpful tip content...
</Aside>
```

**Used in:**
- `debt-strategies.mdx` — Common mistakes warnings
- `rent-vs-buy.mdx` — Opportunity cost warning

## Components Available (Not Yet Used)

### Badge

Inline status labels.

```mdx
<Badge text="New" variant="tip" />
<Badge text="Deprecated" variant="caution" />
```

### Card / CardGrid

Grid of cards (we use custom `TopicCard` instead for consistency).

```mdx
<CardGrid>
  <Card title="Title" icon="star">
    Card content...
  </Card>
</CardGrid>
```

### LinkCard

Simple link card (we use custom `TopicCard`).

```mdx
<LinkCard
  title="Page Title"
  description="Description text"
  href="/path/to/page/"
/>
```

## When to Use Each Component

| Component | Use Case | Instead Of |
|-----------|----------|------------|
| `Tabs` | A/B comparisons | Side-by-side collapsibles |
| `Steps` | Numbered procedures | Numbered lists |
| `Aside` | Warnings, tips | Custom warning boxes |
| `Badge` | Status labels | Custom tags (keep TopicCard tags) |
| `Card` | Content grids | Custom TopicCard (keep existing) |

## Custom Components to Keep

We maintain custom components for consistent styling:

- `TopicCard` — Homepage navigation cards (Wikipedia aesthetic)
- `Collapsible` — Expandable FAQ-style content
- `FAQ` — Structured Q&A sections
- `SeeAlso` — Related links sections
- `DecisionMatrix` — Interactive decision tool
- `Breadcrumbs` — Navigation breadcrumbs

## Search Exclusions

Add `pagefind: false` to frontmatter to exclude pages from search:

```yaml
---
title: Page Title
pagefind: false
---
```

Exclude sections with `data-pagefind-ignore`:

```html
<div data-pagefind-ignore>
  This content won't appear in search results.
</div>
```

## References

- [Starlight Components Docs](https://starlight.astro.build/guides/components/)
- [Tabs Component](https://starlight.astro.build/components/tabs/)
- [Steps Component](https://starlight.astro.build/components/steps/)
- [Asides Component](https://starlight.astro.build/components/asides/)
- [Site Search](https://starlight.astro.build/guides/site-search/)
