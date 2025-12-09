# _dev/

Development tooling for How To Win Capitalism.

## Contents

| File | Purpose |
|------|---------|
| `logger.mjs` | Development logger module |
| `logger.config.json` | Logger configuration |
| `logs/` | Log output (git-ignored) |

## Logger

### Quick Start

```javascript
import { log, logSession, logFile, logError } from './_dev/logger.mjs';

// Basic logging
log.info('Something happened');
log.warn('Watch out');
log.error('Something broke');
log.success('Task completed');
log.debug('Debug details');  // Only shown if logLevel is 'debug'

// Session tracking
logSession.start('Build');
// ... do work ...
logSession.checkpoint('Build', 'Compiled TypeScript');
logSession.end('Build');  // Shows duration

// File operations
logFile.created('src/new-file.ts');
logFile.modified('src/existing.ts');
logFile.deleted('src/old-file.ts');

// Error with stack trace
try {
  throw new Error('Oops');
} catch (e) {
  logError(e, 'While processing data');
}

// Scoped logger
const buildLog = createLogger('build');
buildLog.info('Starting build');
```

### Configuration

Edit `logger.config.json`:

```json
{
  "enabled": true,           // Master toggle
  "logLevel": "info",        // debug | info | warn | error
  "outputDir": "_dev/logs",  // Where to write logs
  "console": true,           // Output to terminal
  "file": true,              // Output to file
  "maxFileSizeMB": 5,        // Max log file size
  "retainDays": 7,           // Auto-delete old logs
  "format": "pretty",        // pretty | json
  "timestamps": true,        // Include timestamps
  "categories": {
    "session": true,         // Toggle session logs
    "file": true,            // Toggle file operation logs
    "error": true,           // Toggle error logs
    "debug": false           // Toggle debug logs
  }
}
```

### CLI Test

```bash
node _dev/logger.mjs
```

### Log Files

Logs are written to `_dev/logs/YYYY-MM-DD.log`:

```
[2025-12-08T23:45:00.000Z] [INFO] Starting build
[2025-12-08T23:45:01.000Z] [SUCCESS] [FILE] Created: src/new-file.ts
[2025-12-08T23:45:02.000Z] [ERROR] Build failed {"error":"Module not found"}
```

Old logs are auto-deleted after `retainDays`.

## Adding More Tools

This folder is for development utilities. To add a new tool:

1. Create `_dev/your-tool.mjs`
2. Add configuration if needed: `_dev/your-tool.config.json`
3. Document in this README
4. Update `.gitignore` if the tool generates output

## Relationship to .private/

| Folder | Purpose | Git Status |
|--------|---------|------------|
| `_dev/` | Dev tools, shared across team | Tracked |
| `.private/` | Personal/admin scripts | Ignored |

`_dev/` is tracked because these tools should be shared. `.private/` is ignored because it contains machine-specific or sensitive scripts.
