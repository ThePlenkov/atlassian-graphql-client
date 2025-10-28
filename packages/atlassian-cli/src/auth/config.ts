/**
 * Atlassian CLI Authentication
 * Uses the generic cli-oauth package for auth management
 */

import { CLIAuth } from 'cli-oauth';
import { ATLASSIAN_DEFAULTS } from '../constants.js';

export type AuthType = 'oauth' | 'mcp' | 'token' | 'basic';

export interface AtlassianConfig {
  // Auth configuration
  auth?: {
    type: AuthType;
    // OAuth-specific settings (requires creating OAuth app)
    oauth?: {
      clientId?: string;
      clientSecret?: string;
      authUrl?: string;
      tokenUrl?: string;
      audience?: string;
      scopes?: string[];
    };
    // MCP-style OAuth (no app registration needed, uses PKCE)
    mcp?: {
      clientId?: string;
      scopes?: string[];
    };
    // API Token auth (only email stored here, token goes to token.json)
    token?: {
      email?: string;
    };
    // Basic auth settings (future)
    basic?: {
      username?: string;
    };
  };
  
  // Atlassian instance settings (REQUIRED - no defaults!)
  baseUrl?: string;  // Base URL for Atlassian instance (e.g., https://your-company.atlassian.net)
  cloudId?: string;
  apiUrl?: string;
  
  // Legacy flat fields for backward compatibility (deprecated)
  /** @deprecated Use auth.oauth.authUrl instead */
  authUrl?: string;
  /** @deprecated Use auth.oauth.tokenUrl instead */
  tokenUrl?: string;
  /** @deprecated Use auth.oauth.audience instead */
  audience?: string;
}

// Create a singleton instance for Atlassian CLI
const auth = new CLIAuth<AtlassianConfig>({
  serviceName: 'atlassian-tools',
});

// Configure OAuth for Atlassian
export async function setOAuthConfig(clientId: string, clientSecret?: string) {
  const config = await loadConfig();
  
  // Check if using MCP-style OAuth (PKCE)
  const useMCP = config.auth?.type === 'mcp';
  
  if (useMCP) {
    // MCP-style OAuth with PKCE (no client secret needed)
    const mcpConfig = config.auth?.mcp || {};
    const mcpClientId = clientId || mcpConfig.clientId || 'eKOEqwwPniBV7aDB'; // Default MCP client ID
    // MCP scopes: Use empty array or minimal scopes (MCP might handle scopes differently)
    const scopes = mcpConfig.scopes || [];
    
    auth.setOAuthConfig({
      serviceName: 'atlassian-tools',
      authUrl: 'https://mcp.atlassian.com/v1/authorize', // Must be HTTPS
      tokenUrl: 'https://mcp.atlassian.com/v1/token',
      clientId: mcpClientId,
      scopes,
      callbackPort: ATLASSIAN_DEFAULTS.CALLBACK_PORT,
      redirectUri: `http://127.0.0.1:${ATLASSIAN_DEFAULTS.CALLBACK_PORT}/`, // MCP requires 127.0.0.1 with root path
      usePKCE: true,
    });
  } else {
    // Traditional OAuth with client secret
    const oauthConfig = config.auth?.oauth || {};
    const authUrl = oauthConfig.authUrl || config.authUrl || ATLASSIAN_DEFAULTS.AUTH_URL;
    const tokenUrl = oauthConfig.tokenUrl || config.tokenUrl || ATLASSIAN_DEFAULTS.TOKEN_URL;
    const audience = oauthConfig.audience || config.audience || ATLASSIAN_DEFAULTS.AUDIENCE;
    const scopes = oauthConfig.scopes || ['read:jira-work', 'read:jira-user', 'offline_access'];
    
    if (!clientSecret) {
      throw new Error('Client secret required for traditional OAuth flow');
    }
    
    auth.setOAuthConfig({
      serviceName: 'atlassian-tools',
      authUrl,
      tokenUrl,
      clientId,
      clientSecret,
      scopes,
      callbackPort: ATLASSIAN_DEFAULTS.CALLBACK_PORT,
      additionalParams: {
        audience,
        prompt: 'consent',
      },
    });
  }
}

/**
 * Load configuration
 */
export async function loadConfig(): Promise<AtlassianConfig> {
  const config = await auth.getConfig();
  return config || {};
}

/**
 * Save configuration
 */
export async function saveConfig(config: AtlassianConfig): Promise<void> {
  await auth.saveConfig(config);
}

/**
 * Save token directly (for API tokens)
 */
export async function saveToken(accessToken: string): Promise<void> {
  await auth.loginToken(accessToken);
}

/**
 * Get valid token (with auto-refresh)
 * For token auth, reads API token from token.json and converts to Basic auth
 */
export async function getValidToken(): Promise<string | undefined> {
  const config = await loadConfig();
  
  // Handle token-based auth (API tokens with Basic Auth)
  if (config.auth?.type === 'token' && config.auth.token?.email) {
    const apiToken = await auth.getValidToken();
    if (apiToken && config.auth.token.email) {
      // Convert to Basic Auth format (email:token)
      return Buffer.from(`${config.auth.token.email}:${apiToken}`).toString('base64');
    }
  }
  
  // Handle OAuth token
  const token = await auth.getValidToken();
  return token || undefined;
}

/**
 * Clear token
 * Removes token from token.json (works for both OAuth and API tokens)
 */
export async function clearToken(): Promise<void> {
  await auth.logout();
}

/**
 * Start OAuth flow
 */
export async function startOAuthFlow(clientId: string, clientSecret: string): Promise<void> {
  await setOAuthConfig(clientId, clientSecret);
  await auth.loginOAuth();
}

/**
 * Get accessible Atlassian resources (cloud IDs)
 */
export async function getAccessibleResources(accessToken: string): Promise<any[]> {
  const config = await loadConfig();
  const resourcesUrl = config.apiUrl 
    ? `${config.apiUrl}/oauth/token/accessible-resources`
    : ATLASSIAN_DEFAULTS.RESOURCES_URL;
    
  const response = await fetch(resourcesUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get accessible resources: ${response.statusText}`);
  }

  return response.json() as Promise<any[]>;
}

// Export the auth instance for advanced usage
export { auth };
