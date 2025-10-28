/**
 * cli-oauth - Generic OAuth 2.0 authentication for CLI applications
 * 
 * Features:
 * - OAuth 2.0 authorization code flow
 * - Automatic token refresh
 * - Concurrent access support with file locking
 * - Atomic file operations
 * - Provider-agnostic
 */

export { CLIAuth } from './cli-auth.js';
export type { CLIAuthOptions } from './cli-auth.js';

export { createAuthCommand } from './cli/index.js';
export type { AuthCommandOptions } from './cli/index.js';

export { ConfigManager } from './storage/config-manager.js';
export type { ConfigManagerOptions } from './storage/config-manager.js';

export { TokenManager, type Token } from './storage/token-manager.js';
export type { TokenManagerOptions } from './storage/token-manager.js';

export { AtomicStorage } from './storage/atomic-storage.js';
export type { StorageOptions } from './storage/atomic-storage.js';

export { startOAuthFlow, refreshAccessToken } from './oauth/flow.js';
export type { OAuthConfig, TokenResponse, RefreshTokenRequest } from './oauth/types.js';

