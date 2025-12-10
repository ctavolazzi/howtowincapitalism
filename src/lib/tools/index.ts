/**
 * Tools
 *
 * Reusable utilities for decision-making and analysis.
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
