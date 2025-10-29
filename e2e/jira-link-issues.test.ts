/**
 * E2E Test: Link Jira issues together
 * 
 * This test demonstrates:
 * - Using mutations with createQueryBuilder()
 * - Linking Jira issues using the createIssueLinks mutation
 * - Querying for link types
 * 
 * Prerequisites:
 * - ATLASSIAN_TOKEN environment variable or ~/.atlassian-tools/token.json
 * - ATLASSIAN_BASE_URL environment variable or ~/.atlassian-tools/config.json
 * - ATLASSIAN_CLOUD_ID in config
 * - At least 2 existing Jira issues to link
 * 
 * Run: node --test e2e/jira-link-issues.test.ts
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { GraphQLClient } from 'graphql-request';
import { createQueryBuilder, $vars, values } from '@atlassian-tools/gql';
import { loadConfig, getValidToken } from '@atlassian-tools/cli/auth/config';
import { print } from 'graphql';

test('Link Jira issues together', async () => {
  console.log('🧪 E2E Test: Link Jira issues\n');

  // Load config and credentials
  const config = await loadConfig();
  const token = await getValidToken();

  assert.ok(token, 'Not authenticated. Run: jira auth login');
  assert.ok(config.cloudId, 'Cloud ID not configured');
  assert.ok(config.baseUrl, 'Base URL not configured');

  const apiUrl = `${config.baseUrl}/gateway/api/graphql`;
  console.log(`📍 API URL: ${apiUrl}`);
  console.log(`☁️  Cloud ID: ${config.cloudId}\n`);

  // Create GraphQL client with experimental API headers
  const authType = config.auth?.type === 'token' ? 'Basic' : 'Bearer';
  const client = new GraphQLClient(apiUrl, {
    headers: {
      authorization: `${authType} ${token}`,
      'Content-Type': 'application/json',
      'X-ExperimentalApi': 'JiraIssueSearch, JiraCreateIssueLinks', // Required for issueSearchStable and createIssueLinks
    },
  });

  const builder = createQueryBuilder();
  
  // Create variables for search
  const searchVars = $vars({
    cloudId: config.cloudId,
    issueSearchInput: {
      jql: 'ORDER BY updated DESC'
    },
    first: 2
  });

  const { cloudId, issueSearchInput, first: firstVar } = searchVars;

  // Step 1: Find 2 issues to link (search for any issues)
  console.log('📋 Step 1: Finding issues to link...\n');

  const searchQuery = builder.query.SearchIssues(q => [
    q.jira(jira => [
      jira.issueSearchStable(
        { cloudId, issueSearchInput, first: firstVar },
        (search: any) => [
          search.totalCount,
          search.edges((edge: any) => [
            edge.node((issue: any) => [
              issue.key,
              issue.issueId,
              issue.summary
            ])
          ])
        ]
      )
    ])
  ]);

  console.log('🔍 Searching for issues...');
  const searchResult = await client.request(searchQuery, values(searchVars));

  const issues = searchResult.jira.issueSearchStable.edges;
  assert.ok(issues.length >= 2, 'Need at least 2 issues to test linking');

  const sourceIssue = issues[0].node;
  const targetIssue = issues[1].node;

  console.log(`   ✓ Source issue: ${sourceIssue.key} (${sourceIssue.summary})`);
  console.log(`   ✓ Target issue: ${targetIssue.key} (${targetIssue.summary})`);
  console.log('');

  // Step 2: Use default "Relates" link type
  console.log('📋 Step 2: Using default "Relates" link type...\n');
  
  // Common default link type ID (typically "Relates")
  // In a real application, you might want to make this configurable
  const linkTypeId = '10000';
  
  console.log(`   ✓ Using link type ID: ${linkTypeId}`);
  console.log(`   ℹ Direction: OUTWARD`);
  console.log('');

  // Step 3: Create the issue link
  console.log('📋 Step 3: Creating issue link...\n');

  // Create variables for mutation
  const mutationVars = $vars({
    cloudId: config.cloudId,
    input: {
      sourceIssueId: sourceIssue.issueId,
      issueLinkTypeId: linkTypeId,
      targetIssueIds: [targetIssue.issueId],
      direction: 'OUTWARD'
    }
  });

  const { cloudId: mutationCloudId, input: inputVar } = mutationVars;

  const linkMutation = builder.mutation.CreateIssueLinks(m => [
    m.jira(jira => [
      jira.createIssueLinks(
        {
          cloudId: mutationCloudId,
          input: inputVar as any
        },
        (payload: any) => [
          payload.success,
          payload.errors((error: any) => [
            error.message
          ] as any),
          payload.issueLinkEdges((edge: any) => [
            edge.node((node: any) => [
              node.id,
              node.issueLinkId,
              node.direction
            ])
          ] as any)
        ]
      )
    ])
  ]);

  console.log('📝 Generated GraphQL Mutation:');
  console.log('─'.repeat(80));
  let mutationString = print(linkMutation);
  // Add @optIn directive for beta API (must be after arguments, before selection set)
  mutationString = mutationString.replace(
    'createIssueLinks(cloudId: $cloudId, input: $input)',
    'createIssueLinks(cloudId: $cloudId, input: $input) @optIn(to: "JiraCreateIssueLinks")'
  );
  console.log(mutationString);
  console.log('─'.repeat(80));
  console.log('');

  console.log('🚀 Executing mutation...\n');

  const linkResult = await client.request(mutationString, values(mutationVars));

  // Assertions
  assert.ok(linkResult.jira, 'jira field should exist');
  assert.ok(linkResult.jira.createIssueLinks, 'createIssueLinks field should exist');
  
  const success = linkResult.jira.createIssueLinks.success;
  const errors = linkResult.jira.createIssueLinks.errors || [];
  const links = linkResult.jira.createIssueLinks.issueLinkEdges || [];

  // Display results
  if (success) {
    console.log('✅ Success! Issue link created:\n');
    console.log(`   ${sourceIssue.key} relates to ${targetIssue.key}`);
    
    if (links.length > 0) {
      console.log(`   Link ID: ${links[0].node.issueLinkId}`);
      console.log(`   Direction: ${links[0].node.direction}`);
    }
    console.log('');
    
    assert.strictEqual(success, true, 'Link creation should be successful');
    assert.ok(links.length > 0, 'Should have created at least one link');
    
    console.log('📝 Note: You may want to manually verify the link in Jira UI');
    console.log(`   Source: ${sourceIssue.key}`);
    console.log(`   Target: ${targetIssue.key}`);
    console.log('');
  } else {
    console.error('❌ Failed to create issue link\n');
    errors.forEach((error: any) => {
      console.error(`   - ${error.message}`);
    });
    assert.fail('Link creation failed');
  }
});

