/**
 * Debug Logger
 * ============
 * Simple, toggleable console logging for development/debugging.
 *
 * - Auto-disabled in production builds
 * - Can be force-enabled via DEBUG env var
 * - Grouped by module for easy filtering
 *
 * Usage:
 *   import { debug } from '../lib/debug';
 *   debug.log('decision-matrix', 'Starting analysis', { options });
 *   debug.warn('decision-matrix', 'Low confidence score');
 *   debug.error('decision-matrix', 'Validation failed', error);
 */

// Enable in dev OR when DEBUG=true
const isDev = typeof import.meta !== 'undefined'
  && import.meta.env?.DEV === true;

const forceDebug = typeof import.meta !== 'undefined'
  && import.meta.env?.PUBLIC_DEBUG === 'true';

const ENABLED = isDev || forceDebug;

// Colors for different modules (browser console)
const MODULE_COLORS: Record<string, string> = {
  'decision-matrix': '#3b82f6',  // blue
  'components': '#10b981',       // green
  'tools': '#f59e0b',            // amber
  'config': '#8b5cf6',           // purple
  'header': '#ec4899',           // pink
  'favorites': '#f97316',        // orange
  'completeness-meter': '#14b8a6', // teal
  'disclaimer': '#eab308',       // yellow
  'navigation': '#6366f1',       // indigo
  'localStorage': '#84cc16',     // lime
  'default': '#6b7280',          // gray
};

// Emoji prefixes for visual scanning
const PREFIX = {
  log: '🔍',
  warn: '⚠️',
  error: '❌',
  success: '✅',
  time: '⏱️',
  group: '📁',
};

function getTimestamp(): string {
  return new Date().toISOString().split('T')[1].slice(0, -1);
}

function formatModule(module: string): string {
  const color = MODULE_COLORS[module] || MODULE_COLORS.default;
  // Returns styled output for browser console
  return `%c[${module}]`;
}

function getModuleStyle(module: string): string {
  const color = MODULE_COLORS[module] || MODULE_COLORS.default;
  return `color: ${color}; font-weight: bold;`;
}

/**
 * Debug logging utilities
 */
export const debug = {
  /** Whether debug logging is enabled */
  enabled: ENABLED,

  /**
   * Log a debug message
   * @param module - Module name (e.g., 'decision-matrix', 'components')
   * @param message - Log message
   * @param data - Optional data to log
   */
  log(module: string, message: string, data?: unknown): void {
    if (!ENABLED) return;
    const ts = getTimestamp();
    console.log(
      `${PREFIX.log} ${ts} ${formatModule(module)} ${message}`,
      getModuleStyle(module),
      data !== undefined ? data : ''
    );
  },

  /**
   * Log a warning
   */
  warn(module: string, message: string, data?: unknown): void {
    if (!ENABLED) return;
    const ts = getTimestamp();
    console.warn(
      `${PREFIX.warn} ${ts} ${formatModule(module)} ${message}`,
      getModuleStyle(module),
      data !== undefined ? data : ''
    );
  },

  /**
   * Log an error (always logs, even in production)
   */
  error(module: string, message: string, data?: unknown): void {
    // Errors always log
    const ts = getTimestamp();
    console.error(
      `${PREFIX.error} ${ts} [${module}] ${message}`,
      data !== undefined ? data : ''
    );
  },

  /**
   * Log a success message
   */
  success(module: string, message: string, data?: unknown): void {
    if (!ENABLED) return;
    const ts = getTimestamp();
    console.log(
      `${PREFIX.success} ${ts} ${formatModule(module)} ${message}`,
      getModuleStyle(module),
      data !== undefined ? data : ''
    );
  },

  /**
   * Start a timer
   * @returns Function to call when done (logs duration)
   */
  time(module: string, label: string): () => void {
    if (!ENABLED) return () => {};
    const start = performance.now();
    const ts = getTimestamp();
    console.log(
      `${PREFIX.time} ${ts} ${formatModule(module)} START: ${label}`,
      getModuleStyle(module)
    );
    return () => {
      const duration = (performance.now() - start).toFixed(2);
      console.log(
        `${PREFIX.time} ${getTimestamp()} ${formatModule(module)} END: ${label} (${duration}ms)`,
        getModuleStyle(module)
      );
    };
  },

  /**
   * Group related logs together
   */
  group(module: string, label: string): void {
    if (!ENABLED) return;
    console.group(`${PREFIX.group} [${module}] ${label}`);
  },

  /**
   * End a log group
   */
  groupEnd(): void {
    if (!ENABLED) return;
    console.groupEnd();
  },

  /**
   * Log a table (useful for arrays/objects)
   */
  table(module: string, label: string, data: unknown): void {
    if (!ENABLED) return;
    const ts = getTimestamp();
    console.log(`${PREFIX.log} ${ts} [${module}] ${label}:`);
    console.table(data);
  },

  /**
   * Conditional log - only logs if condition is true
   */
  assert(module: string, condition: boolean, message: string, data?: unknown): void {
    if (!ENABLED || condition) return;
    this.warn(module, `ASSERT FAILED: ${message}`, data);
  },

  /**
   * Track a user interaction or event
   */
  track(module: string, action: string, details?: Record<string, unknown>): void {
    if (!ENABLED) return;
    const ts = getTimestamp();
    console.log(
      `📊 ${ts} ${formatModule(module)} [TRACK] ${action}`,
      getModuleStyle(module),
      details ?? ''
    );
  },

  /**
   * Inspect an object with expandable output
   */
  inspect(module: string, label: string, obj: unknown): void {
    if (!ENABLED) return;
    const ts = getTimestamp();
    console.log(`🔎 ${ts} [${module}] ${label}:`);
    console.dir(obj, { depth: 4 });
  },

  /**
   * Log page navigation / route change
   */
  route(path: string, referrer?: string): void {
    if (!ENABLED) return;
    const ts = getTimestamp();
    console.log(
      `🧭 ${ts} %c[navigation]%c Route: ${path}`,
      'color: #6366f1; font-weight: bold;',
      '',
      referrer ? { from: referrer } : ''
    );
  },

  /**
   * Log localStorage operations
   */
  storage(action: 'get' | 'set' | 'remove', key: string, value?: unknown): void {
    if (!ENABLED) return;
    const ts = getTimestamp();
    const emoji = action === 'set' ? '💾' : action === 'get' ? '📖' : '🗑️';
    console.log(
      `${emoji} ${ts} %c[localStorage]%c ${action.toUpperCase()}: ${key}`,
      'color: #84cc16; font-weight: bold;',
      '',
      value !== undefined ? value : ''
    );
  },
};

/**
 * Quick single-line debug log (for inline use)
 * Usage: log('Quick debug', someValue);
 */
export const log = ENABLED
  ? (...args: unknown[]) => console.log('🔍', ...args)
  : () => {};

/**
 * Export enabled state for conditional logic
 */
export const DEBUG_ENABLED = ENABLED;

/**
 * Initialize debug logging - call once on app start
 * Logs environment info for troubleshooting
 */
export function initDebug(): void {
  if (!ENABLED) return;

  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║  🔍 DEBUG MODE ENABLED                                        ║
║  How To Win Capitalism - Debug Console                        ║
╠═══════════════════════════════════════════════════════════════╣
║  Environment: ${isDev ? 'Development' : 'Production'}                                    ║
║  Force Debug: ${forceDebug}                                           ║
║  Time: ${new Date().toISOString()}                 ║
╚═══════════════════════════════════════════════════════════════╝
  `);

  debug.log('config', 'Debug modules available', Object.keys(MODULE_COLORS));
}

// Auto-init in dev mode
if (ENABLED && typeof window !== 'undefined') {
  // Client-side: init on load
  window.addEventListener('DOMContentLoaded', () => initDebug());
} else if (ENABLED) {
  // Server-side: init immediately
  initDebug();
}
