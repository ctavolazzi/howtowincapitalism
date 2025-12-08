# How To Win Capitalism

A satirical but practical wiki about financial autonomy.

**Live:** [howtowincapitalism.com](https://howtowincapitalism.com)

## Quick Start

```bash
npm install       # Install dependencies
npm run dev       # Start dev server (localhost:4321)
npm run build     # Build for production
npm run deploy    # Deploy to Cloudflare Pages
```

## Project Structure

```
src/
├── components/          # Astro components (atomic design)
│   ├── atoms/           # Base components (WikiBox)
│   ├── molecules/       # Composed (Disclaimer, DecisionMatrix)
│   └── organisms/       # Complex (PageHeader)
├── content/docs/        # Content pages (.mdx)
│   ├── protocol/        # Wiki definitions
│   ├── field-notes/     # Updates and notes
│   └── reports/         # Downloadable reports
├── lib/
│   ├── constants.ts     # App constants
│   └── tools/           # Reusable utilities
│       └── decision-matrix.ts
└── styles/
    └── custom.css       # Wikipedia-style CSS
```

## Adding Content

Create new pages in `src/content/docs/`:

```bash
# Using the helper script
npm run new protocol my-topic

# Or manually create .mdx files
```

### Using Components

```mdx
---
title: My Page
---

import DecisionMatrix from '../../components/molecules/DecisionMatrix.astro';
import { makeDecision } from '../../lib/tools';

export const result = makeDecision({
  options: ["Option A", "Option B"],
  criteria: ["Cost", "Speed"],
  scores: { "Option A": [8, 6], "Option B": [5, 9] },
  weights: [0.6, 0.4]
});

<DecisionMatrix result={result} title="My Decision" />
```

## Tools

### Decision Matrix

Quantitative decision-making utility. See [`src/lib/tools/README.md`](src/lib/tools/README.md) for full API.

```typescript
import { makeDecision } from './lib/tools';

const result = makeDecision({
  options: ["401k", "Roth IRA"],
  criteria: ["Tax", "Flexibility"],
  scores: { "401k": [9, 3], "Roth IRA": [7, 8] },
  weights: [0.6, 0.4]
});

console.log(result.winner);  // "401k"
```

## Deployment

```bash
# One-command deploy
npm run ship "your commit message"

# Or manually
npm run build
npm run deploy
```

## Documentation

| Document | Location | Purpose |
|----------|----------|---------|
| This README | `README.md` | Quick start |
| Developer Guide | `DEVELOPERS.md` | Detailed dev docs |
| Architecture | `_docs/ARCHITECTURE.md` | System design |
| Devlog | `_docs/DEVLOG.md` | Development history |
| Tools API | `src/lib/tools/README.md` | Utility reference |

## Tech Stack

- **Framework:** [Astro](https://astro.build) v5
- **Theme:** [Starlight](https://starlight.astro.build) (customized)
- **Styling:** Custom CSS (Wikipedia aesthetic)
- **Hosting:** [Cloudflare Pages](https://pages.cloudflare.com)
- **Search:** [Pagefind](https://pagefind.app) (client-side)

## License

MIT
