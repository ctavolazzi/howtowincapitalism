---
description: "MCP server testing policy and procedures"
globs: ["**/.mcp-servers/**/*"]
alwaysApply: false
---

# MCP Server Testing Policy

## Test Suite Location

```bash
/Users/ctavolazzi/Code/.mcp-servers/test-servers.mjs
```

## When to Run Tests

| Trigger | Action |
|---------|--------|
| After modifying server code | **Required** - Run full test suite |
| After Node.js update | Recommended - Verify compatibility |
| After Cursor update | Recommended - Check MCP changes |
| MCP tools not working | **Required** - Diagnose issues |
| Before committing changes | **Required** - Ensure nothing broke |

## Running Tests

```bash
# Standard test
node /Users/ctavolazzi/Code/.mcp-servers/test-servers.mjs

# Verbose (shows errors)
node /Users/ctavolazzi/Code/.mcp-servers/test-servers.mjs --verbose
```

## Expected Output

✅ All tests should pass:
```
Summary: 6/6 tests passed
```

❌ If tests fail:
1. Check error message with `--verbose`
2. Fix the issue
3. Re-run tests until all pass
4. Then commit

## Test Coverage

| Server | Tests |
|--------|-------|
| work-efforts | Syntax, 4 tools, startup |
| simple-tools | Syntax, 3 tools, startup |

## Adding New Servers

When adding a new MCP server:

1. Create server in `.mcp-servers/new-server/server.js`
2. Add to `~/.cursor/mcp.json`
3. Add to `test-servers.mjs` SERVERS array:
   ```javascript
   {
     name: 'new-server',
     path: path.join(__dirname, 'new-server/server.js'),
     tools: ['tool1', 'tool2']
   }
   ```
4. Run test suite
5. Restart Cursor
6. Verify tools appear in Settings → Tools & MCP

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Syntax error | Check for typos, run `node --check server.js` |
| Missing tools | Verify tool names match in ListToolsRequestSchema |
| Startup fails | Check for missing imports or dependencies |
| Server not in Cursor | Restart Cursor, check mcp.json syntax |
