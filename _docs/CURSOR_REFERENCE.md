# Cursor IDE Reference Guide

> Generated: December 14, 2025
> Based on investigation of `~/.cursor/` folder structure

## Overview

Cursor stores configuration, state, and tracking data in `~/.cursor/` (global) and project-specific folders. This guide documents the structure and how to leverage it.

---

## Global Folder Structure (`~/.cursor/`)

```
~/.cursor/
├── ai-tracking/           # AI code generation tracking
│   └── ai-code-tracking.db  # SQLite database
├── argv.json              # VS Code CLI arguments
├── browser-logs/          # Accessibility snapshots from browser tool
├── cli-config.json        # Cursor CLI settings
├── extensions/            # VS Code extensions
├── ide_state.json         # Recently viewed files, state
├── mcp.json               # Global MCP server config
├── plans/                 # Plan files from CreatePlan tool
├── projects/              # Per-project configurations
└── worktrees/             # Git worktree support
```

---

## Key Files Explained

### 1. AI Code Tracking (`ai-tracking/ai-code-tracking.db`)

SQLite database tracking all AI-generated code.

**Schema:**
```sql
ai_code_hashes (hash, source, fileExtension, fileName,
                requestId, conversationId, timestamp, createdAt)
scored_commits (commitHash, branchName, scoredAt)
tracking_state (key, value)
```

**Useful Queries:**
```bash
# Count AI-generated code by file type
sqlite3 ~/.cursor/ai-tracking/ai-code-tracking.db \
  "SELECT fileExtension, COUNT(*) FROM ai_code_hashes GROUP BY fileExtension ORDER BY 2 DESC;"

# AI activity by day
sqlite3 ~/.cursor/ai-tracking/ai-code-tracking.db \
  "SELECT date(createdAt/1000, 'unixepoch'), COUNT(*) FROM ai_code_hashes GROUP BY 1 ORDER BY 1 DESC LIMIT 14;"

# Most AI-assisted files
sqlite3 ~/.cursor/ai-tracking/ai-code-tracking.db \
  "SELECT fileName, COUNT(*) FROM ai_code_hashes WHERE fileName IS NOT NULL GROUP BY 1 ORDER BY 2 DESC LIMIT 15;"
```

### 2. CLI Configuration (`cli-config.json`)

Controls Cursor CLI behavior and permissions.

**Current Settings:**
```json
{
  "editor": { "vimMode": false },
  "permissions": { "allow": ["Shell(ls)"], "deny": [] },
  "approvalMode": "allowlist",
  "sandbox": { "mode": "disabled" }
}
```

**Options:**
| Setting | Purpose |
|---------|---------|
| `vimMode` | Enable Vim keybindings |
| `permissions.allow` | Allowlist for tool execution |
| `permissions.deny` | Denylist for tool execution |
| `approvalMode` | How tool calls are approved |
| `sandbox.mode` | Sandboxing for AI operations |

### 3. Plans Directory (`plans/`)

Stores plan files created by the CreatePlan tool.

**Format:**
```yaml
---
name: Plan Name
overview: "Brief description"
todos:
  - id: task-id
    content: Task description
    status: pending|in_progress|completed
---
# Markdown content with detailed plan
```

**Access saved plans:**
```bash
ls ~/.cursor/plans/
```

### 4. MCP Configuration (`mcp.json`)

Configure Model Context Protocol servers.

**Global config:** `~/.cursor/mcp.json`
**Project config:** `<project>/.cursor/mcp.json`

**Example:**
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "${workspaceFolder}"]
    }
  }
}
```

---

## Project-Specific Data (`~/.cursor/projects/<project-name>/`)

Each project gets its own folder named by path (slashes replaced with dashes).

```
projects/Users-ctavolazzi-Code-howtowincapitalism/
├── agent-tools/           # Cached tool outputs
├── agent-transcripts/     # Full conversation logs (JSON + TXT)
├── assets/                # Images pasted into conversations
├── mcp-cache.json         # MCP server cache
└── terminals/             # Terminal state files
```

### Agent Transcripts

Full conversation history including:
- User messages with context
- AI thinking/reasoning
- Tool calls and results

**Format:** JSON array of role/text objects.

**Location:**
```bash
ls ~/.cursor/projects/*/agent-transcripts/
```

---

## AI Tracking Statistics (This Project)

As of December 14, 2025:

| Metric | Value |
|--------|-------|
| Total code hashes | 9,040 |
| Conversations tracked | 12 |
| Date range | Dec 11-14, 2025 |

**By file type:**
| Extension | Count |
|-----------|-------|
| `.md` | 4,427 |
| `.ts` | 2,289 |
| `.astro` | 2,031 |
| `.mjs` | 273 |

**Most AI-assisted files:**
1. `trade_widget_component.plan.md` (433 edits)
2. `OPERATIONS_MANUAL.md` (374 edits)
3. `BRIEFING.md` (366 edits)
4. `10.10_security_audit.md` (334 edits)
5. `RegisterForm.astro` (271 edits)

---

## Transcript Statistics (This Project)

| Metric | Value |
|--------|-------|
| Total conversations | 22 |
| Total size | 5.7 MB |
| Largest conversation | 780 KB (1,017 messages) |

---

## Useful Commands

### Explore AI tracking
```bash
# Open database in SQLite
sqlite3 ~/.cursor/ai-tracking/ai-code-tracking.db

# Quick stats
sqlite3 ~/.cursor/ai-tracking/ai-code-tracking.db "SELECT COUNT(*) FROM ai_code_hashes;"
```

### List saved plans
```bash
ls -la ~/.cursor/plans/
```

### View transcript sizes
```bash
du -sh ~/.cursor/projects/*/agent-transcripts/
```

### Check extensions count
```bash
find ~/.cursor/extensions -type f | wc -l
```

---

## Best Practices

1. **Review AI tracking periodically** - Understand which files get most AI assistance
2. **Clean up old transcripts** - Large transcripts can accumulate
3. **Use plans for complex tasks** - They persist across sessions
4. **Configure MCP servers globally** - For tools you use across all projects
5. **Back up cli-config.json** - Contains your customizations

---

## Related Files

- `~/.cursor/argv.json` - Hardware acceleration, crash reporter settings
- `~/.cursor/ide_state.json` - Recently viewed files
- `~/.cursor/browser-logs/` - Web automation accessibility snapshots
