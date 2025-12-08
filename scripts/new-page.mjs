#!/usr/bin/env node
/**
 * NEW PAGE SCRIPT
 * 
 * Create a new content page:
 *   npm run new protocol my-concept
 *   npm run new field-notes my-update
 *   npm run new reports my-report
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = join(__dirname, '..', 'src', 'content', 'docs');

const TEMPLATES = {
  protocol: (title, slug) => `---
title: ${title}
description: ${title} - The Protocol
sidebar:
  order: 10
head:
  - tag: meta
    attrs:
      name: keywords
      content: ${slug.replace(/-/g, ', ')}, capitalism, financial autonomy
---

import Disclaimer from '../../../components/molecules/Disclaimer.astro';

<Disclaimer />

## Overview

[Write your overview here]

## Key Points

1. **Point One** — Description
2. **Point Two** — Description
3. **Point Three** — Description

## See Also

- [Introduction](/protocol/introduction/)
`,

  'field-notes': (title, slug) => `---
title: ${title}
description: ${title} - Field Notes
sidebar:
  order: 10
---

import Disclaimer from '../../../components/molecules/Disclaimer.astro';

<Disclaimer />

## Summary

[Write your summary here]

## Details

[Add details here]

## Takeaways

- Takeaway one
- Takeaway two

---

*Last updated: ${new Date().toISOString().split('T')[0]}*
`,

  reports: (title, slug) => `---
title: ${title}
description: ${title} - Reports
sidebar:
  order: 10
---

import Disclaimer from '../../../components/molecules/Disclaimer.astro';

<Disclaimer />

## Report: ${title}

[Write your report here]

## Download

*Report file will be available in \`/reports/${slug}.pdf\`*

---

*Published: ${new Date().toISOString().split('T')[0]}*
`,
};

function toTitleCase(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function main() {
  const [section, slug] = process.argv.slice(2);

  if (!section || !slug) {
    console.log(`
Usage: npm run new <section> <slug>

Sections:
  protocol     - Wiki definitions
  field-notes  - Updates and observations  
  reports      - Downloadable reports

Examples:
  npm run new protocol asset-allocation
  npm run new field-notes market-update-jan
  npm run new reports q1-2025-analysis
`);
    process.exit(1);
  }

  if (!TEMPLATES[section]) {
    console.error(`Error: Unknown section "${section}"`);
    console.error('Valid sections: protocol, field-notes, reports');
    process.exit(1);
  }

  const title = toTitleCase(slug);
  const dir = join(CONTENT_DIR, section);
  const filePath = join(dir, `${slug}.mdx`);

  if (existsSync(filePath)) {
    console.error(`Error: File already exists: ${filePath}`);
    process.exit(1);
  }

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const content = TEMPLATES[section](title, slug);
  writeFileSync(filePath, content);

  console.log(`
✓ Created: src/content/docs/${section}/${slug}.mdx

Next steps:
  1. Edit the file with your content
  2. Run: npm run dev
  3. Preview at: http://localhost:4321/${section}/${slug}/
  4. When ready: npm run ship "Add ${title}"
`);
}

main();

