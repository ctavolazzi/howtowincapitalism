# Documentation Standards

This document describes the documentation standards and processes used in the How To Win Capitalism project.

## Overview

All source files should be comprehensively documented with JSDoc headers. This ensures maintainability, onboarding ease, and code quality.

## File Header Standard

Every source file (`.ts`, `.tsx`, `.js`, `.mjs`, `.astro`) should have a `@fileoverview` JSDoc header:

```typescript
/**
 * @fileoverview Brief description of the module
 *
 * Detailed explanation of what this module does, its purpose
 * in the system, and how it relates to other modules.
 *
 * @module path/to/module
 * @see {@link module:related/module} - Description of relationship
 * @see {@link https://external-docs.com} - External documentation
 *
 * ## Section Headers (optional)
 *
 * Use markdown within JSDoc for complex documentation:
 * - Architecture diagrams (ASCII art)
 * - Configuration tables
 * - Usage examples
 * - Flow diagrams
 *
 * @author How To Win Capitalism Team
 * @since 1.0.0
 */
```

## Required Elements

### Minimum Requirements

1. **`@fileoverview`** - Brief description (1-2 sentences)
2. **`@module`** - Module path for cross-referencing
3. **`@author`** - Team attribution
4. **`@since`** - Version when added

### Recommended Elements

1. **`@see`** - Links to related modules and external docs
2. **Detailed description** - How the module fits in the system
3. **Usage examples** - Code snippets showing typical usage
4. **Architecture diagrams** - ASCII art for complex modules
5. **Configuration tables** - For modules with configuration options

## Documentation Types by File Category

### Library Files (`src/lib/**/*.ts`)

Focus on:
- Architecture diagrams showing data flow
- Configuration tables
- Security considerations
- Usage examples with code snippets

Example sections:
```typescript
/**
 * ## Architecture
 *
 * ```
 * ┌─────────────┐     ┌─────────────┐
 * │   Client    │────▶│   Server    │
 * └─────────────┘     └─────────────┘
 * ```
 *
 * ## Configuration
 *
 * | Option | Type | Default | Description |
 * |--------|------|---------|-------------|
 * | timeout | number | 5000 | Request timeout |
 *
 * ## Usage
 *
 * ```typescript
 * import { myFunction } from './module';
 * const result = myFunction(options);
 * ```
 */
```

### API Routes (`src/pages/api/**/*.ts`)

Focus on:
- HTTP method and endpoint
- Request/response formats
- Authentication requirements
- Error responses
- Rate limiting info

### Components (`src/components/**/*.astro`)

Focus on:
- Props interface documentation
- Slot descriptions
- Usage examples
- Accessibility considerations

### Pages (`src/pages/**/*.astro`)

Focus on:
- Route parameters
- Data fetching
- Authentication requirements
- SEO metadata

## Function Documentation

All exported functions should have JSDoc:

```typescript
/**
 * Brief description of what the function does.
 *
 * @param {string} param1 - Description of first parameter
 * @param {Object} options - Configuration options
 * @param {number} options.timeout - Timeout in milliseconds
 * @returns {Promise<Result>} Description of return value
 * @throws {Error} When something goes wrong
 *
 * @example
 * const result = await myFunction('value', { timeout: 5000 });
 */
export async function myFunction(param1: string, options: Options): Promise<Result> {
  // ...
}
```

## Analysis Tool

Run the codebase analysis tool to check documentation coverage:

```bash
node scripts/analyze-codebase.mjs
```

This generates:
- `_docs/documentation-checklist.md` - Prioritized task list
- `_docs/codebase-analysis.json` - Machine-readable data

### Priority Scoring

Files are prioritized by:
- Lines of code (more code = higher priority)
- Number of functions (more functions = higher priority)
- Technical debt indicators (console.log, TODO comments)
- Missing documentation (no @fileoverview = higher priority)

## Documentation Process

### For New Files

1. Create file with `@fileoverview` header immediately
2. Document all exported functions
3. Add to relevant technical documentation if significant

### For Existing Files (Documentation Initiative)

1. Run `node scripts/analyze-codebase.mjs` to get priority list
2. Work through files by priority category:
   - High: `lib/auth`, `lib/tools`, `api/auth`, `api/admin`
   - Medium: `lib/email`, `lib/other`, `pages`, `components/auth`
   - Lower: `components/*`, `scripts`, `tests`, `config`
3. For each file:
   - Read the existing code
   - Add `@fileoverview` header with comprehensive documentation
   - Add function-level JSDoc where missing
   - Note any technical debt for later cleanup
4. Update checklist after completing each category
5. Commit changes with descriptive messages

### Commit Message Format

```
docs: add comprehensive JSDoc headers to [category] ([count] files)

- Added @fileoverview documentation to:
  - file1.ts: brief description
  - file2.ts: brief description

Coverage: X/130 files (Y%) now have headers
```

## Quality Checklist

Before considering a file "documented":

- [ ] Has `@fileoverview` with clear description
- [ ] Has `@module` tag with correct path
- [ ] Has `@see` references to related modules
- [ ] All exported functions have JSDoc
- [ ] Complex logic has inline comments
- [ ] Usage examples provided where helpful
- [ ] Architecture diagrams for complex modules
- [ ] Configuration tables where applicable

## Technical Documentation

In addition to inline documentation, maintain these technical docs in `_docs/technical/`:

| Document | Content |
|----------|---------|
| `INDEX.md` | Master index of all documentation |
| `ARCHITECTURE.md` | System architecture overview |
| `AUTHENTICATION.md` | Auth system details |
| `API_REFERENCE.md` | All API endpoints |
| `COMPONENTS.md` | Component library |
| `DATA_MODELS.md` | Data schemas |
| `SECURITY.md` | Security measures |
| `TESTING.md` | Testing guide |
| `DEPLOYMENT.md` | Deployment process |

## Progress Tracking

Current documentation progress is tracked in:
- `_docs/documentation-checklist.md` - Per-file checklist
- `_docs/DEVLOG.md` - Session-by-session progress
- `_docs/devlog/YYYY-MM-DD_devlog.md` - Daily details

## Version History

| Date | Change |
|------|--------|
| 2025-12-14 | Initial documentation standards created |
| 2025-12-14 | lib/auth (12 files) documented |
