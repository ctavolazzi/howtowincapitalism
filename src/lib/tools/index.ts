/**
 * @fileoverview Tools Module - Public API Entry Point
 *
 * Central export module for reusable utilities including decision-making
 * tools, analysis helpers, and development utilities.
 *
 * @module lib/tools
 * @see {@link module:lib/tools/decision-matrix} - Quantitative decision tool
 * @see {@link module:lib/tools/logger} - Development logging (Node.js only)
 * @see {@link module:lib/debug} - Debug utilities
 *
 * ## Available Tools
 *
 * | Tool | Purpose | Environment |
 * |------|---------|-------------|
 * | Decision Matrix | Quantitative option comparison | Browser + Node |
 * | Logger | Development logging with file output | Node.js only |
 * | Debug | Conditional debug logging | Browser + Node |
 *
 * ## Decision Matrix Usage
 *
 * ```typescript
 * import { makeDecision } from '@/lib/tools';
 *
 * const result = makeDecision({
 *   options: ['401k', 'Roth IRA', 'Taxable'],
 *   criteria: ['Tax Benefit', 'Flexibility', 'Growth'],
 *   scores: {
 *     '401k': [9, 3, 7],
 *     'Roth IRA': [7, 6, 8],
 *     'Taxable': [2, 9, 7]
 *   },
 *   weights: [0.4, 0.3, 0.3]
 * });
 *
 * console.log(result.winner);        // Best option
 * console.log(result.toString());    // Full analysis
 * ```
 *
 * ## Logger Usage (Node.js scripts only)
 *
 * ```javascript
 * // In .mjs scripts
 * import { log, logSession } from './src/lib/tools/logger.mjs';
 *
 * logSession.start('Build Process');
 * log.info('Building...');
 * logSession.end('Build Process');
 * ```
 *
 * @author How To Win Capitalism Team
 * @since 1.0.0
 */

// Debug utilities - enable with DEBUG=true or in dev mode
export { debug, log, DEBUG_ENABLED } from '../debug';

// Decision Matrix - quantitative decision-making tool
export {
  makeDecision,
  compareMethods,
  DecisionMatrix,
  DecisionResult,
  type AnalysisMethod,
  type DecisionMatrixInput,
  type DecisionResultData,
  type MakeDecisionOptions,
} from './decision-matrix';

// Logger - development logging utility (Node.js only, not for browser)
// Usage: import { log, logSession, logFile, logError } from './logger.mjs';
// Note: This is an ES module (.mjs) for Node.js scripts, not browser code
