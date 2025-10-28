/**
 * Atlassian API endpoints and defaults
 * Single source of truth for all Atlassian URLs
 */

export const ATLASSIAN_DEFAULTS = {
  // OAuth endpoints
  AUTH_URL: 'https://auth.atlassian.com/authorize',
  TOKEN_URL: 'https://auth.atlassian.com/oauth/token',
  
  // API endpoints
  API_BASE_URL: 'https://api.atlassian.com',
  GRAPHQL_URL: 'https://api.atlassian.com/graphql',
  RESOURCES_URL: 'https://api.atlassian.com/oauth/token/accessible-resources',
  
  // OAuth settings
  AUDIENCE: 'api.atlassian.com',
  CALLBACK_PORT: 33418, // Use VS Code MCP's registered port
  
  // Documentation
  OAUTH_CONSOLE_URL: 'https://developer.atlassian.com/console/myapps/',
} as const;

