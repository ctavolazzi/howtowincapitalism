/**
 * @fileoverview Tools barrel export for utilities and analysis tools.
 *
 * Reusable utilities for decision-making, analysis, and debugging.
 *
 * @module lib/tools
 * @see {@link module:lib/tools/decision-matrix} - Decision tool
 * @see {@link module:lib/debug} - Debug utilities
 *
 * @example
 * ```typescript
 * import { makeDecision, debug } from '../lib/tools';
 *
 * const result = makeDecision({ options, criteria, scores });
 * debug.log('myModule', 'Result', result);
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
