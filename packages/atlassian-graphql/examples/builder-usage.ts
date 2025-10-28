/**
 * Example: Using typed-graphql-builder for dynamic field selection
 * 
 * This example demonstrates how to use the typed-graphql-builder API
 * to create GraphQL queries with runtime field selection and full type safety.
 */

import { GraphQLClient } from 'graphql-request';
import { Query, $ } from '../src/index';

// Initialize the GraphQL client
const client = new GraphQLClient('https://api.atlassian.com/graphql', {
  headers: {
    authorization: `Bearer ${process.env.ATLASSIAN_TOKEN}`,
  },
});

/**
 * Example 1: Basic Issue Search with Field Selection
 * 
 * This shows how to query Jira issues with custom field selection.
 * You select only the fields you need using the proxy-based API.
 */
async function basicIssueSearch() {
  // Create a query instance
  const query = new Query();
  
  // Build the query with field selection
  const issueSearchQuery = query.jira(j => [
    j.issueSearch({
      cloudId: $('cloudId'),
      issueSearchInput: $('input'),
      first: 10
    }, search => [
      // Select the fields you want from the search result
      search.edges(edge => [
        edge.node(node => [
          node.id,
          node.key,
          node.summary,
          node.description,
        ])
      ]),
      search.pageInfo(p => [
        p.hasNextPage,
        p.endCursor
      ]),
      search.totalCount
    ])
  ]);
  
  // Execute the query
  const result = await client.request(issueSearchQuery, {
    cloudId: 'your-cloud-id',
    input: { jql: 'project = DEMO' }
  });
  
  console.log('Search Results:', result);
  return result;
}

/**
 * Example 2: Issue Search with Nested Fields
 * 
 * This example shows how to select nested fields like assignee,
 * status, and other complex objects.
 */
async function issueSearchWithNestedFields() {
  const query = new Query();
  
  const detailedIssueQuery = query.jira(j => [
    j.issueSearch({
      cloudId: $('cloudId'),
      issueSearchInput: $('input'),
      first: 10
    }, search => [
      search.edges(edge => [
        edge.node(node => [
          node.id,
          node.key,
          node.summary,
          node.description,
          // Nested field: assignee
          node.assignee(assignee => [
            assignee.accountId,
            assignee.displayName,
            assignee.emailAddress
          ]),
          // Nested field: status
          node.status(status => [
            status.id,
            status.name,
            status.statusCategory(category => [
              category.id,
              category.key,
              category.name
            ])
          ]),
          // Nested field: priority
          node.priority(priority => [
            priority.id,
            priority.name,
            priority.iconUrl
          ]),
          node.created,
          node.updated,
        ])
      ]),
      search.pageInfo(p => [
        p.hasNextPage,
        p.hasPreviousPage,
        p.startCursor,
        p.endCursor
      ]),
      search.totalCount
    ])
  ]);
  
  const result = await client.request(detailedIssueQuery, {
    cloudId: 'your-cloud-id',
    input: { jql: 'assignee = currentUser()' }
  });
  
  console.log('Detailed Results:', result);
  return result;
}

/**
 * Example 3: Single Issue Query
 * 
 * Query a single issue by ID with selected fields.
 */
async function getSingleIssue() {
  const query = new Query();
  
  const issueQuery = query.jira(j => [
    j.issue({
      id: $('issueId')
    }, issue => [
      issue.id,
      issue.key,
      issue.issueType(type => [
        type.id,
        type.name,
        type.iconUrl
      ]),
      issue.summary,
      issue.description,
      issue.assignee(a => [
        a.accountId,
        a.displayName
      ]),
      issue.reporter(r => [
        r.accountId,
        r.displayName
      ]),
      issue.project(p => [
        p.id,
        p.key,
        p.name
      ])
    ])
  ]);
  
  const result = await client.request(issueQuery, {
    issueId: 'issue-123'
  });
  
  console.log('Issue:', result);
  return result;
}

/**
 * Example 4: Confluence Query
 * 
 * Query Confluence spaces with field selection.
 */
async function getConfluenceSpaces() {
  const query = new Query();
  
  const spacesQuery = query.confluence({
    cloudId: $('cloudId')
  }, c => [
    c.spaces({
      keys: $('keys'),
      first: 10
    }, spaces => [
      spaces.edges(edge => [
        edge.node(node => [
          node.id,
          node.key,
          node.name,
          node.description,
          node.createdAt,
          node.homepageId
        ])
      ]),
      spaces.pageInfo(p => [
        p.hasNextPage,
        p.endCursor
      ])
    ])
  ]);
  
  const result = await client.request(spacesQuery, {
    cloudId: 'your-cloud-id',
    keys: ['DEMO', 'TEST']
  });
  
  console.log('Spaces:', result);
  return result;
}

/**
 * Example 5: Using Variables with Complex Types
 * 
 * Shows how to use $ for variables with complex input types.
 */
async function issueSearchWithComplexFilters() {
  const query = new Query();
  
  const complexQuery = query.jira(j => [
    j.issueSearch({
      cloudId: $('cloudId'),
      issueSearchInput: $('input'),
      options: $('options'),
      first: $('pageSize')
    }, search => [
      search.edges(edge => [
        edge.node(node => [
          node.id,
          node.key,
          node.summary
        ])
      ]),
      search.totalCount
    ])
  ]);
  
  const result = await client.request(complexQuery, {
    cloudId: 'your-cloud-id',
    input: {
      jql: 'project = DEMO AND status = "In Progress"'
    },
    options: {
      // Add any options here
    },
    pageSize: 25
  });
  
  console.log('Filtered Results:', result);
  return result;
}

// Run examples (uncomment to test)
// basicIssueSearch().catch(console.error);
// issueSearchWithNestedFields().catch(console.error);
// getSingleIssue().catch(console.error);
// getConfluenceSpaces().catch(console.error);
// issueSearchWithComplexFilters().catch(console.error);

export {
  basicIssueSearch,
  issueSearchWithNestedFields,
  getSingleIssue,
  getConfluenceSpaces,
  issueSearchWithComplexFilters
};

