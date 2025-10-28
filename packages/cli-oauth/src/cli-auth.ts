/**
 * Main CLI authentication class
 * Combines OAuth flow, config management, and token management
 */

import { ConfigManager } from './storage/config-manager.js';
import { TokenManager, Token } from './storage/token-manager.js';
import { startOAuthFlow, refreshAccessToken } from './oauth/flow.js';
import type { OAuthConfig } from './oauth/types.js';

export interface CLIAuthOptions {
  serviceName: string;
  baseDir?: string;
}

export class CLIAuth<TConfig = Record<string, any>> {
  private configManager: ConfigManager<TConfig>;
  private tokenManager: TokenManager;
  private oauthConfig?: OAuthConfig;

  constructor(options: CLIAuthOptions) {
    this.configManager = new ConfigManager<TConfig>({
      serviceName: options.serviceName,
      baseDir: options.baseDir,
    });
    this.tokenManager = new TokenManager({
      serviceName: options.serviceName,
      baseDir: options.baseDir,
    });
  }

  /**
   * Set OAuth configuration (required for OAuth login)
   */
  setOAuthConfig(config: OAuthConfig): void {
    this.oauthConfig = config;
  }

  /**
   * Login via OAuth flow
   */
  async loginOAuth(): Promise<Token> {
    if (!this.oauthConfig) {
      throw new Error('OAuth config not set. Call setOAuthConfig() first.');
    }

    const token = await startOAuthFlow(this.oauthConfig);
    await this.tokenManager.save(token);
    
    // Save OAuth config for token refresh
    await this.configManager.update((current) => ({
      ...(current || ({} as TConfig)),
      _oauth: {
        clientId: this.oauthConfig!.clientId,
        clientSecret: this.oauthConfig!.clientSecret,
        tokenUrl: this.oauthConfig!.tokenUrl,
      },
    } as TConfig));

    return token;
  }

  /**
   * Login with direct token (for API tokens)
   */
  async loginToken(accessToken: string): Promise<void> {
    await this.tokenManager.save({
      access_token: accessToken,
    });
  }

  /**
   * Logout (clear token)
   */
  async logout(): Promise<void> {
    await this.tokenManager.clear();
  }

  /**
   * Get valid access token (auto-refresh if needed)
   */
  async getValidToken(): Promise<string | null> {
    const token = await this.tokenManager.load();

    if (!token) {
      return null;
    }

    // If not expired, return as-is
    if (!this.tokenManager.isExpired(token)) {
      return token.access_token;
    }

    // Token expired - try to refresh
    if (!token.refresh_token) {
      return null;
    }

    // Get OAuth config from stored config
    const config = await this.configManager.load();
    const oauthInfo = (config as any)?._oauth;

    if (!oauthInfo?.clientId || !oauthInfo?.clientSecret || !oauthInfo?.tokenUrl) {
      return null;
    }

    try {
      // Refresh token
      const refreshed = await refreshAccessToken(
        {
          serviceName: '',
          authUrl: '',
          tokenUrl: oauthInfo.tokenUrl,
          clientId: oauthInfo.clientId,
          clientSecret: oauthInfo.clientSecret,
          scopes: [],
        },
        token.refresh_token
      );

      // Save refreshed token
      await this.tokenManager.save(refreshed);

      return refreshed.access_token;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return null;
    }
  }

  /**
   * Get token info
   */
  async getTokenInfo(): Promise<{
    hasToken: boolean;
    isExpired: boolean;
    expiresIn?: number;
    hasRefreshToken: boolean;
  }> {
    const token = await this.tokenManager.load();

    if (!token) {
      return {
        hasToken: false,
        isExpired: false,
        hasRefreshToken: false,
      };
    }

    const isExpired = this.tokenManager.isExpired(token);
    const expiresIn = token.expires_at
      ? Math.floor((token.expires_at - Date.now()) / 1000 / 60)
      : undefined;

    return {
      hasToken: true,
      isExpired,
      expiresIn,
      hasRefreshToken: !!token.refresh_token,
    };
  }

  /**
   * Config management
   */
  async getConfig(): Promise<TConfig | null> {
    return await this.configManager.load();
  }

  async saveConfig(config: TConfig): Promise<void> {
    await this.configManager.save(config);
  }

  async updateConfig(updateFn: (current: TConfig | null) => TConfig): Promise<TConfig> {
    return await this.configManager.update(updateFn);
  }

  async getConfigValue<K extends keyof TConfig>(key: K): Promise<TConfig[K] | undefined> {
    return await this.configManager.get(key);
  }

  async setConfigValue<K extends keyof TConfig>(key: K, value: TConfig[K]): Promise<void> {
    await this.configManager.set(key, value);
  }

  /**
   * Get paths
   */
  getPaths(): { configDir: string; configFile: string; tokenFile: string } {
    const baseDir = this.configManager.getPath();
    return {
      configDir: baseDir,
      configFile: `${baseDir}/config.json`,
      tokenFile: `${baseDir}/token.json`,
    };
  }

  /**
   * Check if config file exists
   */
  async configExists(): Promise<boolean> {
    return this.configManager.fileExists();
  }
}

