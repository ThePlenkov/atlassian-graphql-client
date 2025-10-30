import { GraphQLClient } from 'graphql-request';
import { createQueryBuilder, $$, type QueryFields } from '@atlassian-tools/gql';
import { print } from 'graphql';
import { getValidToken, loadConfig } from '../../auth/config.js';
import { ATLASSIAN_DEFAULTS } from '../../constants.js';
import type { Logger } from '../../utils/logger.js';
import { createLogger } from '../../utils/logger.js';

interface GetIssueOptions {
  fields?: string;
  all?: boolean;
  verbose?: boolean;
  json?: boolean;
  cloudId?: string;
  token?: string;
  url?: string;
  logger?: Logger;
}

export async function getIssue(issueKey: string, options: GetIssueOptions) {
  // Create logger (can be overridden by parent process)
  // If --json is set, suppress all non-JSON output (even if verbose)
  const logger = options.logger || createLogger(options.json ? false : (options.verbose || false));
  
  logger.info(`\n🔍 Fetching issue: ${issueKey}`);

  // Get config for cloud ID
  const config = await loadConfig();
  if (!config.cloudId) {
    logger.error('❌ Error: Cloud ID not found in config');
    logger.error('\n💡 Tip: The cloud ID should be fetched automatically on first login');
    logger.error('   Config file: ~/.atlassian-tools/config.json');
    process.exit(1);
  }

  // Create query builder
  const builder = createQueryBuilder();
  const issueKeyVar = $$<string>('issueKey');
  const cloudIdVar = $$<string>('cloudId');

  try {
    // Build the query with full type safety
    const query = builder.query('GetJiraIssue', (q: QueryFields) => [
      q.jira(jira => [
        jira.issueByKey({ cloudId: cloudIdVar, key: issueKeyVar }, issue => 
          options.all ? [
            // Comprehensive field list for --all flag
            issue.id,
            issue.key,
            issue.issueId,
            issue.webUrl,
            issue.issueTypeAvatarUrl,
            issue.summary,
            issue.summaryField(s => [s.text]),
            issue.descriptionField(d => [d.richText(r => [r.plainText])]),
            issue.status(s => [s.name]),
            issue.statusField(s => [s.name]),
            issue.statusCategory(s => [s.name]),
            issue.priorityField(p => [p.name]),
            issue.issueType(t => [t.name]),
            issue.issueTypeField(t => [t.name]),
            issue.assigneeField(a => [a.user(u => [u.name, u.accountId])]),
            issue.createdField(c => [c.dateTime]),
            issue.updatedField(u => [u.dateTime]),
            issue.dueDateField(d => [d.date]),
            issue.startDateField(s => [s.date]),
            issue.resolutionDateField(r => [r.dateTime]),
            issue.projectField(p => [p.project(pr => [pr.key, pr.name])]),
            issue.resolutionField(r => [r.name])
          ] : [
            // Default fields
            issue.id,
            issue.key,
            issue.issueId,
            issue.webUrl,
            issue.summary,
            issue.summaryField(s => [s.text]),
            issue.descriptionField(d => [d.richText(r => [r.plainText])]),
            issue.statusField(s => [s.name]),
            issue.priorityField(p => [p.name]),
            issue.assigneeField(a => [a.user(u => [u.name])]),
            issue.createdField(c => [c.dateTime]),
            issue.updatedField(u => [u.dateTime]),
            issue.issueType(t => [t.name]),
            issue.projectField(p => [p.project(pr => [pr.name])])
          ]
        )
      ])
    ]);

    logger.info('📝 Generated GraphQL Query:');
    logger.info('─'.repeat(60));
    logger.info(print(query));
    logger.info('─'.repeat(60));
    logger.info('');

    // Get token from options, env var, or stored config
    let token = options.token || process.env.ATLASSIAN_TOKEN;
    
    if (!token) {
      token = await getValidToken() || undefined;
    }

    if (!token) {
      logger.error('❌ Error: Not authenticated');
      logger.error('\nPlease login first:');
      logger.error('  atlassian login --client-id YOUR_ID --client-secret YOUR_SECRET');
      logger.error('\nOr provide a token:');
      logger.error('  --token YOUR_TOKEN');
      logger.error('  or set ATLASSIAN_TOKEN environment variable');
      process.exit(1);
    }

    // Get API URL
    const baseUrl = config.baseUrl || ATLASSIAN_DEFAULTS.API_BASE_URL;
    const apiUrl = options.url || config.apiUrl || process.env.ATLASSIAN_API_URL || `${baseUrl}/gateway/api/graphql`;
    
    // Determine auth type
    const authType = config.auth?.type === 'token' ? 'Basic' : 'Bearer';

    // Execute the query
    logger.info('🚀 Executing query...\n');
    logger.info(`📍 URL: ${apiUrl}`);
    logger.info(`🔐 Auth: ${authType}`);
    logger.info(`☁️  Cloud ID: ${config.cloudId}\n`);
    
    const client = new GraphQLClient(apiUrl, {
      headers: {
        authorization: `${authType} ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await client.request(query, { 
      issueKey: issueKey,
      cloudId: config.cloudId
    });

    // Output the result
    if (options.json) {
      // Pure JSON mode - just the data, no decorations
      console.log(JSON.stringify(result, null, 2));
    } else {
      // Human-friendly mode with emoji
      logger.log('✅ Result:');
      logger.log(JSON.stringify(result, null, 2));
      logger.log('');
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes('does not exist')) {
      logger.error(`\n❌ Error: ${errorMessage}`);
      logger.error('\n💡 Tip: Check available fields in the schema or use simpler fields like:');
      logger.error('   id, key, issueId, webUrl');
    } else {
      logger.error('\n❌ Error:', errorMessage);
      
      // Type-safe error handling
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'errors' in error.response &&
        Array.isArray(error.response.errors)
      ) {
        logger.error('\nGraphQL Errors:');
        error.response.errors.forEach((err: unknown) => {
          if (err && typeof err === 'object' && 'message' in err) {
            logger.error(`  - ${String(err.message)}`);
          }
        });
      }
    }
    process.exit(1);
  }
}

