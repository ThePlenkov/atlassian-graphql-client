/**
 * Token manager with concurrent access support and automatic refresh
 */

import { AtomicStorage } from './atomic-storage.js';

export interface Token {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
}

export interface TokenManagerOptions {
  serviceName: string;
  baseDir?: string;
}

export class TokenManager {
  private storage: AtomicStorage;
  private tokenFile = 'token.json';

  constructor(options: TokenManagerOptions) {
    this.storage = new AtomicStorage({
      serviceName: options.serviceName,
      baseDir: options.baseDir,
    });
  }

  /**
   * Load token
   */
  async load(): Promise<Token | null> {
    return this.storage.read<Token>(this.tokenFile);
  }

  /**
   * Save token
   */
  async save(token: Token): Promise<void> {
    await this.storage.write(this.tokenFile, token);
  }

  /**
   * Update token atomically
   */
  async update(updateFn: (current: Token | null) => Token): Promise<Token> {
    return this.storage.update(this.tokenFile, updateFn);
  }

  /**
   * Clear token
   */
  async clear(): Promise<void> {
    await this.storage.delete(this.tokenFile);
  }

  /**
   * Check if token is expired
   */
  isExpired(token: Token): boolean {
    if (!token.expires_at) {
      return false;
    }
    return Date.now() >= token.expires_at;
  }

  /**
   * Get valid token (returns null if expired without refresh token)
   */
  async getValid(): Promise<Token | null> {
    const token = await this.load();
    
    if (!token) {
      return null;
    }

    // If not expired, return as-is
    if (!this.isExpired(token)) {
      return token;
    }

    // Expired but no refresh token
    if (!token.refresh_token) {
      return null;
    }

    // Token needs refresh (but caller should handle the actual refresh)
    return null;
  }

  /**
   * Get token file path
   */
  getPath(): string {
    return this.storage.getBaseDir();
  }
}

