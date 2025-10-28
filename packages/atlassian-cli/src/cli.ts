#!/usr/bin/env node
/**
 * Atlassian CLI
 * 
 * A command-line interface for Atlassian APIs using GraphQL
 */

import { Command } from 'commander';
import { createAuthCommand } from 'cli-oauth';
import { getIssue } from './commands/jira/get-issue.js';
import { searchIssues } from './commands/jira/search-issues.js';
import { loginCommand } from './commands/auth/login.js';
import { auth, setOAuthConfig, saveConfig, loadConfig, getAccessibleResources, clearToken } from './auth/config.js';
import { ATLASSIAN_DEFAULTS } from './constants.js';

const program = new Command();

program
  .name('atlassian')
  .description('CLI for Atlassian APIs using GraphQL')
  .version('0.1.0');

// Auth commands
const authCmd = new Command('auth')
  .description('Authentication commands');

// Custom login command with interactive prompts
authCmd
  .command('login')
  .description('Login to Atlassian')
  .option('--method <type>', 'Authentication method: token or oauth', /^(token|oauth)$/)
  .option('--email <email>', 'Email address (for token auth)')
  .option('--token <token>', 'API token (for token auth)')
  .option('--client-id <id>', 'OAuth client ID (for OAuth)')
  .option('--client-secret <secret>', 'OAuth client secret (for OAuth)')
  .action(loginCommand);

// Logout and whoami from cli-oauth
authCmd
  .command('logout')
  .description('Logout and remove credentials')
  .action(async () => {
    await clearToken();
    console.log('✅ Logged out successfully!\n');
    console.log('Your credentials have been removed from:');
    console.log(`   ~/.atlassian-tools/token.json\n`);
  });

authCmd
  .command('whoami')
  .description('Show current authentication status')
  .action(async () => {
    const config = await loadConfig();
    const token = await auth.getValidToken();
    
    console.log('\n📁 Configuration:');
    console.log('   Config dir:  ~/.atlassian-tools');
    console.log('   Config file: ~/.atlassian-tools/config.json');
    console.log('   Token file:  ~/.atlassian-tools/token.json\n');
    
    if (token) {
      console.log('✅ Logged in\n');
      console.log('Token info:');
      console.log('   Expires: Never (API token)');
      console.log('   Has refresh token: No\n');
      console.log('Configuration:', JSON.stringify(config, null, 2));
      console.log('');
    } else {
      console.log('❌ Not logged in\n');
      console.log('Run: <command> auth login --help\n');
    }
  });

program.addCommand(authCmd);

// Jira commands
const jira = program
  .command('jira')
  .description('Jira commands');

jira
  .command('get <issue-key>')
  .description('Get a Jira issue by key')
  .option('-f, --fields <fields>', 'Comma-separated list of fields to fetch (default: common fields)')
  .option('--all', 'Fetch all available fields')
  .option('-v, --verbose', 'Show detailed query information')
  .option('--json', 'Output pure JSON (no decorations, pipeable to jq)')
  .option('--cloud-id <cloudId>', 'Atlassian cloud ID (overrides stored config)')
  .option('--token <token>', 'Atlassian API token (overrides stored token)')
  .option('--url <url>', 'Atlassian API URL (overrides default)')
  .action(getIssue);

jira
  .command('search <jql>')
  .description('Search Jira issues using JQL')
  .option('-f, --fields <fields>', 'Comma-separated list of fields to fetch', 'id,key,webUrl')
  .option('-l, --limit <limit>', 'Maximum number of results', '10')
  .option('--cloud-id <cloudId>', 'Atlassian cloud ID (overrides stored config)')
  .option('--token <token>', 'Atlassian API token (overrides stored token)')
  .option('--url <url>', 'Atlassian API URL (overrides default)')
  .action(searchIssues);

// Confluence commands (future)
const confluence = program
  .command('confluence')
  .description('Confluence commands (coming soon)');

confluence
  .command('get <page-id>')
  .description('Get a Confluence page by ID (coming soon)')
  .action(() => {
    console.log('Confluence commands coming soon!');
  });

program.parse();

