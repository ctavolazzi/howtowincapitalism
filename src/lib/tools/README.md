# Tools

Reusable utilities for decision-making and analysis.

## Available Tools

### Decision Matrix

A quantitative decision-making tool for comparing options against weighted criteria.

**Import:**
```typescript
import { makeDecision, compareMethods, DecisionMatrix, DecisionResult } from './decision-matrix';
// Or from index:
import { makeDecision } from '../lib/tools';
```

**Basic Usage:**
```typescript
const result = makeDecision({
  options: ["Option A", "Option B", "Option C"],
  criteria: ["Cost", "Speed", "Quality"],
  scores: {
    "Option A": [7, 8, 6],
    "Option B": [9, 5, 7],
    "Option C": [6, 9, 8]
  },
  weights: [0.3, 0.2, 0.5]  // Must sum to 1.0 (auto-normalized)
});

console.log(result.winner);           // "Option C"
console.log(result.confidenceScore);  // 45.2
console.log(result.recommendation);   // "Moderate recommendation..."
```

**Analysis Methods:**

| Method | Description | Best For |
|--------|-------------|----------|
| `weighted` | Traditional weighted scoring (default) | General decisions |
| `normalized` | Scores normalized to 0-100 per criterion | Different scale inputs |
| `ranking` | Convert scores to ranks per criterion | When relative order matters |
| `best_worst` | Scale relative to best/worst per criterion | Tight score ranges |

**Compare All Methods:**
```typescript
const comparison = compareMethods(options, criteria, scores, weights);
console.log(comparison);  // Shows consensus across all 4 methods
```

**With Astro Component:**
```astro
---
import DecisionMatrix from '../../components/molecules/DecisionMatrix.astro';
import { makeDecision } from '../../lib/tools';

const result = makeDecision({
  options: ["401k", "Roth IRA", "Taxable"],
  criteria: ["Tax Benefit", "Flexibility", "Growth"],
  scores: { "401k": [9, 3, 7], "Roth IRA": [7, 6, 8], "Taxable": [2, 9, 7] },
  weights: [0.4, 0.3, 0.3]
});
---

<DecisionMatrix result={result} title="Investment Account Comparison" />
```

**Result Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `winner` | string | Top-ranked option |
| `rankings` | [string, number][] | All options sorted by score |
| `confidenceScore` | number | 0-100, gap between 1st and 2nd |
| `recommendation` | string | Human-readable advice |
| `warnings` | string[] | Issues like statistical ties |
| `strengths` | Record | Top criteria per option |
| `weaknesses` | Record | Bottom criteria per option |
| `whyWinnerWon` | string | Explanation of winning factors |

**Serialization:**
```typescript
result.toObject();  // Plain object
result.toJSON();    // JSON string
result.toString();  // CLI-formatted output
```

## Adding New Tools

1. Create `src/lib/tools/your-tool.ts`
2. Export from `src/lib/tools/index.ts`
3. Document in this README
4. If web-renderable, create matching Astro component
