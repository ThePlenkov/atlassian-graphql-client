/**
 * OAuth 2.0 types and interfaces
 */

export interface OAuthConfig {
  /**
   * Service name (e.g., 'atlassian-tools', 'gitlab-cli')
   */
  serviceName: string;

  /**
   * Authorization endpoint URL
   */
  authUrl: string;

  /**
   * Token endpoint URL
   */
  tokenUrl: string;

  /**
   * OAuth client ID
   */
  clientId: string;

  /**
   * OAuth client secret (optional for PKCE flow)
   */
  clientSecret?: string;

  /**
   * Redirect URI (default: http://localhost:3000/callback)
   */
  redirectUri?: string;

  /**
   * OAuth scopes
   */
  scopes: string[];

  /**
   * Additional query parameters for authorization URL
   */
  additionalParams?: Record<string, string>;

  /**
   * Custom port for local callback server (default: 3000)
   */
  callbackPort?: number;

  /**
   * Timeout for OAuth flow in milliseconds (default: 300000 = 5 minutes)
   */
  timeout?: number;

  /**
   * Use PKCE (Proof Key for Code Exchange) flow instead of client secret
   * More secure for public clients like CLIs
   */
  usePKCE?: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
}

export interface RefreshTokenRequest {
  grant_type: 'refresh_token';
  client_id: string;
  client_secret: string;
  refresh_token: string;
}

