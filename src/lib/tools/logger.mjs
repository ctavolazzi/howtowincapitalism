#!/usr/bin/env node
/**
 * Development Logger
 * ------------------
 * Flexible logging utility for development and debugging.
 *
 * Usage:
 *   import { log, logSession, logFile, logError } from './_dev/logger.mjs';
 *
 *   log.info('Message');
 *   log.warn('Warning');
 *   log.error('Error');
 *   log.debug('Debug info');
 *
 *   logSession.start('Task name');
 *   logSession.end('Task name');
 *
 *   logFile.created('path/to/file.ts');
 *   logFile.modified('path/to/file.ts');
 *   logFile.deleted('path/to/file.ts');
 *
 *   logError(error, 'Context message');
 */

import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get directory of this script
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

// =============================================================================
// CONFIGURATION
// =============================================================================

const DEFAULT_CONFIG = {
  enabled: true,
  logLevel: 'info',
  outputDir: '_dev/logs',
  console: true,
  file: true,
  maxFileSizeMB: 5,
  retainDays: 7,
  format: 'pretty',
  timestamps: true,
  categories: {
    session: true,
    file: true,
    error: true,
    debug: false
  }
};

function loadConfig() {
  const configPath = join(__dirname, 'logger.config.json');
  try {
    if (existsSync(configPath)) {
      const content = readFileSync(configPath, 'utf-8');
      return { ...DEFAULT_CONFIG, ...JSON.parse(content) };
    }
  } catch (e) {
    console.warn('[Logger] Could not load config, using defaults');
  }
  return DEFAULT_CONFIG;
}

const config = loadConfig();

// =============================================================================
// LOG LEVELS
// =============================================================================

const LEVELS = {
  debug: { priority: 0, emoji: '🔍', color: '\x1b[90m' },
  info:  { priority: 1, emoji: 'ℹ️ ', color: '\x1b[36m' },
  warn:  { priority: 2, emoji: '⚠️ ', color: '\x1b[33m' },
  error: { priority: 3, emoji: '❌', color: '\x1b[31m' },
  success: { priority: 1, emoji: '✅', color: '\x1b[32m' },
};

const RESET = '\x1b[0m';

function shouldLog(level) {
  if (!config.enabled) return false;
  const configPriority = LEVELS[config.logLevel]?.priority ?? 1;
  const msgPriority = LEVELS[level]?.priority ?? 1;
  return msgPriority >= configPriority;
}

// =============================================================================
// FILE OUTPUT
// =============================================================================

function getLogFilePath() {
  const now = new Date();
  const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const outputDir = join(ROOT, config.outputDir);

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  return join(outputDir, `${date}.log`);
}

function writeToFile(message) {
  if (!config.file) return;

  try {
    const logPath = getLogFilePath();
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] ${message}\n`;
    appendFileSync(logPath, line);
  } catch (e) {
    // Silently fail file logging
  }
}

function cleanOldLogs() {
  if (!config.retainDays) return;

  try {
    const outputDir = join(ROOT, config.outputDir);
    if (!existsSync(outputDir)) return;

    const cutoff = Date.now() - (config.retainDays * 24 * 60 * 60 * 1000);
    const files = readdirSync(outputDir);

    for (const file of files) {
      if (!file.endsWith('.log')) continue;
      const filePath = join(outputDir, file);
      const stat = statSync(filePath);
      if (stat.mtimeMs < cutoff) {
        unlinkSync(filePath);
      }
    }
  } catch (e) {
    // Silently fail cleanup
  }
}

// Run cleanup on import
cleanOldLogs();

// =============================================================================
// FORMATTERS
// =============================================================================

function formatMessage(level, category, message, data) {
  const levelInfo = LEVELS[level] || LEVELS.info;
  const timestamp = config.timestamps ? new Date().toLocaleTimeString() : '';

  let formatted = '';

  if (config.format === 'pretty') {
    const parts = [];
    if (timestamp) parts.push(`[${timestamp}]`);
    parts.push(levelInfo.emoji);
    if (category) parts.push(`[${category.toUpperCase()}]`);
    parts.push(message);
    formatted = parts.join(' ');
  } else {
    // JSON format
    formatted = JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data
    });
  }

  return { formatted, levelInfo };
}

// =============================================================================
// CORE LOGGING
// =============================================================================

function logMessage(level, category, message, data = null) {
  if (!shouldLog(level)) return;
  if (category && config.categories[category] === false) return;

  const { formatted, levelInfo } = formatMessage(level, category, message, data);

  // Console output
  if (config.console) {
    const coloredMessage = `${levelInfo.color}${formatted}${RESET}`;

    if (level === 'error') {
      console.error(coloredMessage);
    } else if (level === 'warn') {
      console.warn(coloredMessage);
    } else {
      console.log(coloredMessage);
    }

    // Log data separately if present
    if (data && config.logLevel === 'debug') {
      console.log(data);
    }
  }

  // File output (no colors)
  const plainMessage = category
    ? `[${level.toUpperCase()}] [${category.toUpperCase()}] ${message}`
    : `[${level.toUpperCase()}] ${message}`;
  writeToFile(plainMessage + (data ? ` ${JSON.stringify(data)}` : ''));
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * General logging
 */
export const log = {
  debug: (message, data) => logMessage('debug', null, message, data),
  info: (message, data) => logMessage('info', null, message, data),
  warn: (message, data) => logMessage('warn', null, message, data),
  error: (message, data) => logMessage('error', null, message, data),
  success: (message, data) => logMessage('success', null, message, data),
};

/**
 * Session logging
 */
const sessionTimers = new Map();

export const logSession = {
  start: (name, details = {}) => {
    sessionTimers.set(name, Date.now());
    logMessage('info', 'session', `Started: ${name}`, details);
  },

  end: (name, details = {}) => {
    const startTime = sessionTimers.get(name);
    const duration = startTime ? `${((Date.now() - startTime) / 1000).toFixed(2)}s` : 'unknown';
    sessionTimers.delete(name);
    logMessage('success', 'session', `Completed: ${name} (${duration})`, details);
  },

  checkpoint: (name, message) => {
    logMessage('info', 'session', `[${name}] ${message}`);
  },

  fail: (name, error) => {
    sessionTimers.delete(name);
    logMessage('error', 'session', `Failed: ${name}`, { error: error?.message || error });
  }
};

/**
 * File operation logging
 */
export const logFile = {
  created: (path, details) => logMessage('success', 'file', `Created: ${path}`, details),
  modified: (path, details) => logMessage('info', 'file', `Modified: ${path}`, details),
  deleted: (path, details) => logMessage('warn', 'file', `Deleted: ${path}`, details),
  read: (path, details) => logMessage('debug', 'file', `Read: ${path}`, details),
  error: (path, error) => logMessage('error', 'file', `Error: ${path}`, { error: error?.message || error }),
};

/**
 * Error logging with stack trace
 */
export function logError(error, context = '') {
  const message = context ? `${context}: ${error.message}` : error.message;
  logMessage('error', 'error', message, {
    name: error.name,
    stack: error.stack?.split('\n').slice(0, 5).join('\n')
  });
}

/**
 * Create a scoped logger
 */
export function createLogger(scope) {
  return {
    debug: (msg, data) => logMessage('debug', scope, msg, data),
    info: (msg, data) => logMessage('info', scope, msg, data),
    warn: (msg, data) => logMessage('warn', scope, msg, data),
    error: (msg, data) => logMessage('error', scope, msg, data),
    success: (msg, data) => logMessage('success', scope, msg, data),
  };
}

/**
 * Get log file path (for external tools)
 */
export function getLogPath() {
  return getLogFilePath();
}

/**
 * Read today's log
 */
export function readTodayLog() {
  const logPath = getLogFilePath();
  if (existsSync(logPath)) {
    return readFileSync(logPath, 'utf-8');
  }
  return '';
}

// =============================================================================
// CLI USAGE
// =============================================================================

// If run directly, show test output
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('\n📋 Logger Test\n');

  log.debug('This is a debug message');
  log.info('This is an info message');
  log.warn('This is a warning');
  log.error('This is an error');
  log.success('This is a success message');

  console.log('');

  logSession.start('Test Task');
  logFile.created('test/file.ts');
  logFile.modified('test/file.ts');
  logSession.checkpoint('Test Task', 'Halfway done');
  logSession.end('Test Task');

  console.log('');

  try {
    throw new Error('Test error');
  } catch (e) {
    logError(e, 'Testing error logging');
  }

  console.log(`\n📁 Log file: ${getLogPath()}\n`);
}
