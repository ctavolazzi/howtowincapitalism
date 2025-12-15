/**
 * @fileoverview Site-wide constants and configuration values.
 *
 * Central location for site metadata, default text, and external links.
 * Import from here for consistent configuration across the codebase.
 *
 * @module lib/constants
 *
 * @example
 * ```typescript
 * import { SITE, DEFAULTS, LINKS } from '../lib/constants';
 *
 * console.log(SITE.name); // "How To Win Capitalism"
 * console.log(DEFAULTS.disclaimer);
 * ```
 *
 * @author How To Win Capitalism Team
 * @since 1.0.0
 */

import { debug } from './debug';

export const SITE = {
  name: 'How To Win Capitalism',
  description: 'A satirical but practical wiki about financial autonomy',
  url: 'https://howtowincapitalism.com',
} as const;

export const DEFAULTS = {
  disclaimer: "I am not a financial advisor. This is not financial advice. These are notes on a system. Do your own research.",
} as const;

// External links - update when ready
export const LINKS = {
  gumroad: '#', // Update when product is ready
} as const;

// Log config load in dev
debug.log('config', 'Site constants loaded', {
  site: SITE.name,
  url: SITE.url,
});
