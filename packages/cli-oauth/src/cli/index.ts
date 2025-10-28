/**
 * Generic auth command for CLI applications
 * Can be attached as a subcommand to any CLI using Commander
 */

import { Command } from 'commander';
import type { CLIAuth } from '../cli-auth.js';
import { loginCommand, type LoginOptions, type LoginHandlers } from './commands/login.js';
import { logoutCommand } from './commands/logout.js';
import { whoamiCommand } from './commands/whoami.js';

export interface AuthCommandOptions<TConfig> {
  /**
   * CLIAuth instance
   */
  auth: CLIAuth<TConfig>;

  /**
   * Read OAuth credentials from config storage (if not provided via CLI)
   * This allows each CLI to implement its own config structure
   */
  getOAuthCredentials?: () => Promise<{ clientId?: string; clientSecret?: string }>;

  /**
   * Additional login handler (e.g., to fetch and save cloud IDs)
   */
  onLoginSuccess?: (token: { access_token: string; refresh_token?: string }) => Promise<void>;

  /**
   * Additional logout handler (e.g., to clear API tokens from config)
   */
  onLogout?: () => Promise<void>;

  /**
   * Custom resource fetcher (e.g., to fetch accessible cloud IDs)
   */
  fetchResources?: (accessToken: string) => Promise<any[]>;

  /**
   * Custom resource formatter for display
   */
  formatResource?: (resource: any, index: number) => string;

  /**
   * Instructions for obtaining OAuth credentials
   */
  oauthInstructions?: string;
}

/**
 * Create a generic auth command that can be attached to any CLI
 */
export function createAuthCommand<TConfig>(options: AuthCommandOptions<TConfig>): Command {
  const { 
    auth, 
    getOAuthCredentials,
    onLoginSuccess,
    fetchResources,
    formatResource,
    oauthInstructions = 'Visit your OAuth provider to create credentials'
  } = options;

  const authCmd = new Command('auth')
    .description('Authentication commands');

  const loginHandlers: LoginHandlers = {
    getOAuthCredentials,
    onLoginSuccess,
    fetchResources,
    formatResource,
  };

  // Login command
  authCmd
    .command('login')
    .description('Login via OAuth or API token')
    .option('--client-id <id>', 'OAuth client ID')
    .option('--client-secret <secret>', 'OAuth client secret')
    .option('--token <token>', 'Use API token directly (alternative to OAuth)')
    .action(async (cmdOptions: LoginOptions) => {
      try {
        await loginCommand(auth, cmdOptions, loginHandlers, oauthInstructions);
      } catch (error: any) {
        console.error('\n❌ Login failed:', error.message);
        process.exit(1);
      }
    });

  // Logout command
  authCmd
    .command('logout')
    .description('Logout and clear stored credentials')
    .action(async () => {
      try {
        await logoutCommand(auth);
      } catch (error: any) {
        console.error('❌ Error during logout:', error.message);
        process.exit(1);
      }
    });

  // Whoami command
  authCmd
    .command('whoami')
    .description('Display current authentication status')
    .action(async () => {
      try {
        await whoamiCommand(auth);
      } catch (error: any) {
        console.error('❌ Error:', error.message);
        process.exit(1);
      }
    });

  return authCmd;
}

export type { LoginOptions, LoginHandlers } from './commands/login.js';

