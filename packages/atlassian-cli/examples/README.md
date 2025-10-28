# Examples

## Logger Pattern for Different Use Cases

The Atlassian CLI uses a flexible logger pattern that allows different consumers to control output:

### 1. **CLI Usage** (Human-Friendly)

```bash
# Quiet mode (default) - only show results
npx jira get FSINN-1306

# Verbose mode - show query, URL, debug info
npx jira get FSINN-1306 --verbose
```

### 2. **MCP Server Usage** (Silent)

See `mcp-usage.ts` for a complete example of how an MCP server would:
- Suppress all console output
- Capture errors for MCP error responses  
- Return only the data payload

```typescript
import { getIssue } from '@atlassian-tools/cli';
import { SilentLogger } from '@atlassian-tools/cli/utils/logger';

// Call with silent logger
await getIssue('FSINN-1306', {
  logger: new SilentLogger(),
  fields: 'id,key,summary',
});
```

### 3. **Programmatic Usage** (Custom Logger)

```typescript
import { getIssue } from '@atlassian-tools/cli';
import type { Logger } from '@atlassian-tools/cli/utils/logger';

// Create custom logger that logs to file or external service
class FileLogger implements Logger {
  debug(msg: string) { fs.appendFileSync('debug.log', msg + '\n'); }
  info(msg: string) { fs.appendFileSync('info.log', msg + '\n'); }
  warn(msg: string) { fs.appendFileSync('warn.log', msg + '\n'); }
  error(msg: string) { fs.appendFileSync('error.log', msg + '\n'); }
  log(msg: string) { fs.appendFileSync('output.log', msg + '\n'); }
}

await getIssue('FSINN-1306', {
  logger: new FileLogger(),
});
```

## Benefits

1. **Flexible Output Control**: Different consumers can control what gets logged
2. **MCP Compatible**: Silent mode for MCP servers that need clean JSON output
3. **Testable**: Easy to test by injecting a mock logger
4. **Future-Proof**: Ready for other integrations (webhooks, file logging, etc.)

