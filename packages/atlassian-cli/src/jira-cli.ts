#!/usr/bin/env node

/**
 * Jira CLI - Standalone shortcut with auth support
 * 
 * Usage:
 *   jira auth login --client-id ... --client-secret ...
 *   jira get ISSUE-123
 *   jira search "project = MYPROJECT"
 */

import { Command } from 'commander';
import { getIssue } from './commands/jira/get-issue.js';
import { searchIssues } from './commands/jira/search-issues.js';
import { linkIssues } from './commands/jira/link-issues.js';
import { loginCommand } from './commands/auth/login.js';
import { auth, clearToken, loadConfig } from './auth/config.js';

const program = new Command();

program
  .name('jira')
  .description('Jira CLI - shortcut for Atlassian Jira commands')
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

// Logout and whoami
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
      console.log('Run: jira auth login\n');
    }
  });

program.addCommand(authCmd);

// Get issue command
program
  .command('get <issueKey>')
  .description('Get a Jira issue by key')
  .option('-f, --fields <fields>', 'Comma-separated list of fields to retrieve (default: common fields)')
  .option('--all', 'Fetch all available fields')
  .option('-v, --verbose', 'Show detailed query information')
  .option('--json', 'Output pure JSON (no decorations, pipeable to jq)')
  .option('--cloud-id <cloudId>', 'Atlassian Cloud ID')
  .option('--token <token>', 'Bearer token for authentication')
  .option('--url <url>', 'GraphQL API URL')
  .action(async (issueKey: string, options: any) => {
    await getIssue(issueKey, options);
  });

// Search issues command
program
  .command('search <jql>')
  .description('Search Jira issues using JQL')
  .option('-f, --fields <fields>', 'Comma-separated list of fields to retrieve', 'id,key,issueId,webUrl,summaryField.text')
  .option('-l, --limit <limit>', 'Maximum number of results', '10')
  .option('--cloud-id <cloudId>', 'Atlassian Cloud ID')
  .option('--token <token>', 'Bearer token for authentication')
  .option('--url <url>', 'GraphQL API URL')
  .action(async (jql: string, options: any) => {
    await searchIssues(jql, options);
  });

// Link issues command
program
  .command('link <sourceIssueKey> <targetIssueKeys...>')
  .description('Link Jira issues together (e.g., jira link PROJ-123 PROJ-456 PROJ-789)')
  .option('--link-type-id <id>', 'Link type ID (if not specified, uses "Relates" type)')
  .option('--direction <direction>', 'Link direction: INWARD or OUTWARD', 'OUTWARD')
  .option('-v, --verbose', 'Show detailed query information')
  .option('--json', 'Output pure JSON (no decorations, pipeable to jq)')
  .option('--cloud-id <cloudId>', 'Atlassian Cloud ID')
  .option('--token <token>', 'Bearer token for authentication')
  .option('--url <url>', 'GraphQL API URL')
  .action(async (sourceIssueKey: string, targetIssueKeys: string[], options: any) => {
    await linkIssues(sourceIssueKey, targetIssueKeys, options);
  });

// Parse arguments
program.parse();

