/**
 * E2E Test: Search for Jira issues assigned to me
 * 
 * This test demonstrates:
 * - Using createQueryBuilder() for dynamic queries
 * - Searching for issues with JQL
 * - Field selection with nested objects
 * - Pagination
 * 
 * Prerequisites:
 * - ATLASSIAN_TOKEN environment variable or ~/.atlassian-tools/token.json
 * - ATLASSIAN_BASE_URL environment variable or ~/.atlassian-tools/config.json
 * - ATLASSIAN_CLOUD_ID in config
 * 
 * Run: node --test e2e/jira-search-my-issues.test.ts
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { GraphQLClient } from 'graphql-request';
import { createQueryBuilder, $$ } from '@atlassian-tools/gql';
import { loadConfig, getValidToken } from '@atlassian-tools/cli/auth/config';
import { print } from 'graphql';

test('Search for Jira issues assigned to me', async () => {
  console.log('🧪 E2E Test: Search for my assigned Jira issues\n');

  // Load config and credentials
  const config = await loadConfig();
  const token = await getValidToken();

  assert.ok(token, 'Not authenticated. Run: jira auth login');
  assert.ok(config.cloudId, 'Cloud ID not configured');
  assert.ok(config.baseUrl, 'Base URL not configured');

  const apiUrl = `${config.baseUrl}/gateway/api/graphql`;
  console.log(`📍 API URL: ${apiUrl}`);
  console.log(`☁️  Cloud ID: ${config.cloudId}\n`);

  // Create GraphQL client
  const authType = config.auth?.type === 'token' ? 'Basic' : 'Bearer';
  const client = new GraphQLClient(apiUrl, {
    headers: {
      authorization: `${authType} ${token}`,
      'Content-Type': 'application/json',
      'X-ExperimentalApi': 'JiraIssueSearch', // Required for issueSearchStable
    },
  });

  // Build the query
  const builder = createQueryBuilder();
  const cloudId = $$<string>('cloudId');
  const issueSearchInput = $$<any>('issueSearchInput');
  const first = $$<number>('first');

  const query = builder.query('SearchMyIssues', q => [
    q.jira(jira => [
      jira.issueSearchStable(
        { cloudId, issueSearchInput, first },
        search => [
          search.totalCount,
          search.edges(edge => [
            edge.node(issue => [
              issue.key,
              issue.summary,
              issue.issueId,
              issue.webUrl,
              issue.statusField(status => [
                status.name
              ]),
              issue.priorityField(priority => [
                priority.name
              ]),
              issue.assigneeField(assignee => [
                assignee.user(user => [
                  user.name,
                  user.accountId
                ])
              ]),
              issue.projectField(project => [
                project.project(proj => [
                  proj.key,
                  proj.name
                ])
              ])
            ])
          ]),
          search.pageInfo(pageInfo => [
            pageInfo.hasNextPage,
            pageInfo.endCursor
          ])
        ]
      )
    ])
  ]);

  console.log('📝 Generated GraphQL Query:');
  console.log('─'.repeat(80));
  console.log(print(query));
  console.log('─'.repeat(80));
  console.log('');

  // Execute the query
  console.log('🚀 Executing query...\n');

  const result = await client.request(query, {
    cloudId: config.cloudId,
    issueSearchInput: {
      jql: 'assignee = currentUser() ORDER BY updated DESC'
    },
    first: 10
  });

  // Assertions
  assert.ok(result.jira, 'jira field should exist');
  assert.ok(result.jira.issueSearchStable, 'issueSearchStable field should exist');
  
  const totalCount = result.jira.issueSearchStable.totalCount;
  const issues = result.jira.issueSearchStable.edges;
  const pageInfo = result.jira.issueSearchStable.pageInfo;

  assert.ok(typeof totalCount === 'number', 'totalCount should be a number');
  assert.ok(Array.isArray(issues), 'issues should be an array');
  assert.ok(pageInfo, 'pageInfo should exist');

  // Display results
  console.log(`✅ Success! Found ${totalCount} issues assigned to you\n`);
  console.log(`📋 Showing top ${issues.length} issues:\n`);

  issues.forEach((edge: any, index: number) => {
    const issue = edge.node;
    console.log(`${index + 1}. ${issue.key}: ${issue.summary}`);
    console.log(`   Status: ${issue.statusField?.name || 'N/A'}`);
    console.log(`   Priority: ${issue.priorityField?.name || 'N/A'}`);
    console.log(`   Project: ${issue.projectField?.project?.name || 'N/A'} (${issue.projectField?.project?.key || 'N/A'})`);
    console.log(`   Assignee: ${issue.assigneeField?.user?.name || 'N/A'} (${issue.assigneeField?.user?.accountId || 'N/A'})`);
    console.log(`   URL: ${issue.webUrl}`);
    console.log('');
  });

  if (pageInfo.hasNextPage) {
    console.log(`📄 More results available (cursor: ${pageInfo.endCursor})`);
  }
});

