/**
 * Main entry point for programmatic usage of Atlassian CLI
 * Useful for MCP servers or other integrations
 */

// Export command functions
export { getIssue } from './commands/jira/get-issue.js';

// Export logger utilities
export { 
  createLogger,
  ConsoleLogger,
  SilentLogger,
  type Logger 
} from './utils/logger.js';

// Export auth utilities
export { 
  loadConfig,
  saveConfig,
  getValidToken,
  clearToken,
  type AtlassianConfig
} from './auth/config.js';

