import { GraphQLClient } from 'graphql-request';
import { createQueryBuilder, $$ } from '@atlassian-tools/gql';
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

// Default fields to fetch if none specified
// Note: Avoid duplicate parent paths (e.g., assigneeField.user.X twice) as the builder doesn't merge them yet
const DEFAULT_FIELDS = [
  'id',
  'key', 
  'issueId',
  'webUrl',
  'summary',  // Direct scalar field
  'summaryField.text',  // SingleLineTextField
  'descriptionField.richText.plainText',  // RichTextField
  'statusField.name',  // StatusField
  'priorityField.name',  // PriorityField
  'assigneeField.user.name',  // UserField - just name for now (can't merge with .email yet)
  'createdField.dateTime',  // DateTimeField
  'updatedField.dateTime',  // DateTimeField
  'issueType.name',  // IssueType
  'projectField.project.name',  // Project name
].join(',');

// Comprehensive field list for --all flag
const ALL_FIELDS = [
  // Core identifiers
  'id',
  'key', 
  'issueId',
  'webUrl',
  'issueTypeAvatarUrl',
  
  // Summary & Description
  'summary',
  'summaryField.text',
  'descriptionField.richText.plainText',
  
  // Status & Priority
  'status.name',
  'statusField.name',
  'statusCategory.name',
  'priorityField.name',
  
  // Issue Type
  'issueType.name',
  'issueTypeField.name',
  
  // People
  'assigneeField.user.name',
  'assigneeField.user.accountId',
  
  // Dates
  'createdField.dateTime',
  'updatedField.dateTime',
  'dueDateField.date',
  'startDateField.date',
  'resolutionDateField.dateTime',
  
  // Project
  'projectField.project.key',
  'projectField.project.name',
  
  // Resolution
  'resolutionField.name',
].join(',');

/**
 * Recursively build field selection based on dot notation
 * Example: "summaryField.text" becomes summaryField(s => [s.text])
 * Example: "assigneeField.user.name" becomes assigneeField(a => [a.user(u => [u.name])])
 */
function buildFieldSelection(fieldPath: string, proxy: any): any {
  const parts = fieldPath.split('.');
  
  if (parts.length === 0) {
    throw new Error('Field path cannot be empty');
  }
  
  if (parts.length === 1) {
    // Simple scalar field - terminal case
    return proxy[parts[0]]();
  }
  
  // Nested field - recursively build the selection
  const [currentField, ...remainingParts] = parts;
  return proxy[currentField]((nested: any) => [
    buildFieldSelection(remainingParts.join('.'), nested)
  ]);
}

export async function getIssue(issueKey: string, options: GetIssueOptions) {
  // Create logger (can be overridden by parent process)
  // If --json is set, suppress all non-JSON output (even if verbose)
  const logger = options.logger || createLogger(options.json ? false : (options.verbose || false));
  
  logger.info(`\n🔍 Fetching issue: ${issueKey}`);
  
  // Determine which fields to fetch
  let fieldsInput: string;
  if (options.all) {
    fieldsInput = ALL_FIELDS;
    logger.info(`📋 Fields: Using ALL available fields (${ALL_FIELDS.split(',').length} fields)\n`);
  } else if (options.fields) {
    fieldsInput = options.fields;
    const fieldsList = fieldsInput.split(',').map(f => f.trim());
    logger.info(`📋 Fields: ${fieldsList.join(', ')}\n`);
  } else {
    fieldsInput = DEFAULT_FIELDS;
    logger.info(`📋 Fields: Using default fields\n`);
  }
  
  const fields = fieldsInput.split(',').map(f => f.trim());

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
    // Build the query dynamically using issueByKey
    const query = builder.query('GetJiraIssue', (q: any) => [
      q.jira((jira: any) => [
        jira.issueByKey({ cloudId: cloudIdVar, key: issueKeyVar }, (issue: any) => 
          fields.map(field => buildFieldSelection(field, issue))
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

  } catch (error: any) {
    if (error.message && error.message.includes('does not exist')) {
      logger.error(`\n❌ Error: ${error.message}`);
      logger.error('\n💡 Tip: Check available fields in the schema or use simpler fields like:');
      logger.error('   id, key, issueId, webUrl');
    } else {
      logger.error('\n❌ Error:', error.message || error);
      if (error.response?.errors) {
        logger.error('\nGraphQL Errors:');
        error.response.errors.forEach((err: any) => {
          logger.error(`  - ${err.message}`);
        });
      }
    }
    process.exit(1);
  }
}

