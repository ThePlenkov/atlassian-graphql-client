import { GraphQLClient } from 'graphql-request';
import { createQueryBuilder, $$ } from '@atlassian-tools/gql';
import { print } from 'graphql';
import { getValidToken, loadConfig } from '../../auth/config.js';
import { ATLASSIAN_DEFAULTS } from '../../constants.js';
import type { Logger } from '../../utils/logger.js';
import { createLogger } from '../../utils/logger.js';

interface LinkIssuesOptions {
  type?: string;
  linkTypeId?: string;
  direction?: 'INWARD' | 'OUTWARD';
  verbose?: boolean;
  json?: boolean;
  cloudId?: string;
  token?: string;
  url?: string;
  logger?: Logger;
}

/**
 * Link two or more Jira issues together
 * 
 * @param sourceIssueKey - The source issue key (e.g., PROJ-123)
 * @param targetIssueKeys - Array of target issue keys to link to
 * @param options - Command options
 */
export async function linkIssues(
  sourceIssueKey: string, 
  targetIssueKeys: string[], 
  options: LinkIssuesOptions
) {
  // Create logger
  const logger = options.logger || createLogger(options.json ? false : (options.verbose || false));
  
  logger.info(`\n🔗 Linking Jira issues`);
  logger.info(`   Source: ${sourceIssueKey}`);
  logger.info(`   Target(s): ${targetIssueKeys.join(', ')}\n`);

  // Get config for cloud ID
  const config = await loadConfig();
  if (!config.cloudId) {
    logger.error('❌ Error: Cloud ID not found in config');
    logger.error('\n💡 Tip: The cloud ID should be fetched automatically on first login');
    logger.error('   Config file: ~/.atlassian-tools/config.json');
    process.exit(1);
  }

  // Get token
  let token = options.token || process.env.ATLASSIAN_TOKEN;
  if (!token) {
    token = await getValidToken() || undefined;
  }

  if (!token) {
    logger.error('❌ Error: Not authenticated');
    logger.error('\nPlease login first:');
    logger.error('  jira auth login');
    process.exit(1);
  }

  // Get API URL
  const baseUrl = config.baseUrl || ATLASSIAN_DEFAULTS.API_BASE_URL;
  const apiUrl = options.url || config.apiUrl || process.env.ATLASSIAN_API_URL || `${baseUrl}/gateway/api/graphql`;
  
  // Determine auth type
  const authType = config.auth?.type === 'token' ? 'Basic' : 'Bearer';

  // Create GraphQL client
  const client = new GraphQLClient(apiUrl, {
    headers: {
      authorization: `${authType} ${token}`,
      'Content-Type': 'application/json',
      'X-ExperimentalApi': 'JiraCreateIssueLinks', // Required for createIssueLinks mutation
    },
  });

  try {
    // Step 1: Get issue IDs from issue keys
    logger.info('📋 Step 1: Resolving issue IDs...\n');
    
    const builder = createQueryBuilder();
    const cloudIdVar = $$<string>('cloudId');
    
    // Build query to get source issue ID
    const sourceKeyVar = $$<string>('sourceKey');
    const sourceQuery = builder.query('GetSourceIssue', q => [
      q.jira(jira => [
        jira.issueByKey({ cloudId: cloudIdVar, key: sourceKeyVar }, issue => [
          issue.issueId,
          issue.key
        ])
      ])
    ]);

    logger.info('   Fetching source issue ID...');
    const sourceResult = await client.request(sourceQuery, {
      cloudId: config.cloudId,
      sourceKey: sourceIssueKey
    });

    const sourceIssueId = sourceResult.jira.issueByKey.issueId;
    logger.info(`   ✓ Source issue: ${sourceIssueKey} → ${sourceIssueId}`);

    // Build query to get target issue IDs
    const targetQueries = targetIssueKeys.map((targetKey, index) => {
      const keyVar = $$<string>(`targetKey${index}`);
      return builder.query(`GetTargetIssue${index}`, q => [
        q.jira(jira => [
          jira.issueByKey({ cloudId: cloudIdVar, key: keyVar }, issue => [
            issue.issueId,
            issue.key
          ])
        ])
      ]);
    });

    logger.info('   Fetching target issue IDs...');
    const targetResults = await Promise.all(
      targetQueries.map((query, index) => 
        client.request(query, {
          cloudId: config.cloudId,
          [`targetKey${index}`]: targetIssueKeys[index]
        })
      )
    );

    const targetIssueIds = targetResults.map((result, index) => {
      const issueId = result.jira.issueByKey.issueId;
      logger.info(`   ✓ Target issue: ${targetIssueKeys[index]} → ${issueId}`);
      return issueId;
    });

    logger.info('');

    // Step 2: Determine link type ID
    logger.info('📋 Step 2: Determining link type...\n');
    
    const linkTypeId = options.linkTypeId;
    
    if (!linkTypeId) {
      logger.error('❌ Error: Link type ID is required');
      logger.error('\n💡 Use --linkTypeId option to specify a link type ID');
      logger.error('   Common link type IDs:');
      logger.error('     - "10000" (Relates - most common)');
      logger.error('     - "10001" (Blocks)');
      logger.error('     - "10002" (Clones)');
      logger.error('     - "10003" (Duplicates)');
      logger.error('   \n   Note: The exact link type ID depends on your Jira instance configuration\n');
      process.exit(1);
    }
    
    logger.info(`   Using link type ID: ${linkTypeId}\n`);

    // Step 3: Create the links
    logger.info('📋 Step 3: Creating issue links...\n');
    
    const direction = options.direction || 'OUTWARD';
    const directionVar = $$<string>('direction');
    const sourceIssueIdVar = $$<string>('sourceIssueId');
    const linkTypeIdVar = $$<string>('linkTypeId');
    const targetIssueIdsVar = $$<string[]>('targetIssueIds');

    const linkMutation = builder.mutation('CreateIssueLinks', m => [
      m.jira(jira => [
        jira.createIssueLinks(
          { 
            cloudId: cloudIdVar, 
            input: {
              sourceIssueId: sourceIssueIdVar,
              issueLinkTypeId: linkTypeIdVar,
              targetIssueIds: targetIssueIdsVar,
              direction: directionVar
            }
          },
          payload => [
            payload.success,
            payload.errors(error => [
              error.message
            ]),
            payload.issueLinkEdges(edge => [
              edge.node(node => [
                node.id,
                node.issueLinkId
              ])
            ])
          ]
        )
      ])
    ]);

    logger.info('📝 Generated GraphQL Mutation:');
    logger.info('─'.repeat(60));
    logger.info(print(linkMutation));
    logger.info('─'.repeat(60));
    logger.info('');

    logger.info('🚀 Executing mutation...\n');

    const linkResult = await client.request(linkMutation, {
      cloudId: config.cloudId,
      sourceIssueId: sourceIssueId,
      linkTypeId: linkTypeId,
      targetIssueIds: targetIssueIds,
      direction: direction
    });

    // Output the result
    if (options.json) {
      // Pure JSON mode
      console.log(JSON.stringify(linkResult, null, 2));
    } else {
      // Human-friendly mode
      if (linkResult.jira.createIssueLinks.success) {
        logger.log('✅ Success! Issue links created:\n');
        
        const links = linkResult.jira.createIssueLinks.issueLinkEdges || [];
        links.forEach((edge: { node: { issueLinkId: string } }, index: number) => {
          logger.log(`   ${index + 1}. ${sourceIssueKey} ${direction === 'OUTWARD' ? '→' : '←'} ${targetIssueKeys[index]}`);
          logger.log(`      Link ID: ${edge.node.issueLinkId}`);
        });
        logger.log('');
      } else {
        logger.error('❌ Failed to create issue links\n');
        const errors = linkResult.jira.createIssueLinks.errors || [];
        errors.forEach((error: { message: string }) => {
          logger.error(`   - ${error.message}`);
        });
        process.exit(1);
      }
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
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
    process.exit(1);
  }
}

