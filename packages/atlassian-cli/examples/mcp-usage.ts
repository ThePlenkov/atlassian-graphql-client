/**
 * Example: How an MCP server would use the Atlassian CLI with a custom logger
 * 
 * In MCP, you want to:
 * 1. Suppress all debug/info output (no console noise)
 * 2. Only return the actual data
 * 3. Handle errors gracefully
 */

import { getIssue } from '../src/commands/jira/get-issue.js';
import type { Logger } from '../src/utils/logger.js';

/**
 * Custom logger for MCP that:
 * - Captures errors for MCP error responses
 * - Suppresses all info/debug output
 * - Only returns the actual result data
 */
class MCPLogger implements Logger {
  private errors: string[] = [];

  debug(_message: string, ..._args: any[]): void {
    // Silent - MCP doesn't need debug logs
  }

  info(_message: string, ..._args: any[]): void {
    // Silent - MCP doesn't need progress updates
  }

  warn(message: string, ...args: any[]): void {
    // Could log to MCP's internal logger if needed
    console.warn('[MCP Warning]', message, ...args);
  }

  error(message: string, ...args: any[]): void {
    // Capture errors for MCP response
    this.errors.push(message);
  }

  log(_message: string, ..._args: any[]): void {
    // In MCP mode, we intercept the result data and handle it separately
    // The actual output is captured from the function return value
  }

  getErrors(): string[] {
    return this.errors;
  }

  clearErrors(): void {
    this.errors = [];
  }
}

/**
 * Example MCP tool implementation
 */
async function mcpGetJiraIssueTool(args: {
  issueKey: string;
  fields?: string;
  all?: boolean;
}) {
  const logger = new MCPLogger();

  try {
    // Call the command with our custom logger
    await getIssue(args.issueKey, {
      fields: args.fields,
      all: args.all,
      logger, // Pass custom logger
    });

    // In a real MCP implementation, you'd modify getIssue to return the result
    // instead of logging it, or capture the log output
    return {
      success: true,
      // data would come from the function return value
    };
  } catch (error: any) {
    // Return MCP-formatted error
    return {
      success: false,
      error: {
        code: 'JIRA_QUERY_ERROR',
        message: logger.getErrors().join('\n') || error.message,
      },
    };
  }
}

/**
 * Example usage in MCP server
 */
async function exampleMCPServerUsage() {
  console.log('=== MCP Server Example ===\n');

  // MCP tool call: get issue with default fields
  const result1 = await mcpGetJiraIssueTool({
    issueKey: 'FSINN-1306',
  });
  console.log('Tool call 1:', result1);

  // MCP tool call: get issue with specific fields
  const result2 = await mcpGetJiraIssueTool({
    issueKey: 'FSINN-1306',
    fields: 'id,key,summary,statusField.name',
  });
  console.log('Tool call 2:', result2);

  // MCP tool call: get all fields
  const result3 = await mcpGetJiraIssueTool({
    issueKey: 'FSINN-1306',
    all: true,
  });
  console.log('Tool call 3:', result3);
}

// Run example if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  exampleMCPServerUsage().catch(console.error);
}

export { MCPLogger, mcpGetJiraIssueTool };

