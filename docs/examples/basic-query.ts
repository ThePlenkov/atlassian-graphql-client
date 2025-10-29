/**
 * Basic Query Example - Canonical Reference
 * 
 * This is the standard example used throughout the documentation.
 * Shows the core value proposition: dynamic + type-safe + small bundles.
 */

import { createQueryBuilder, $$ } from 'gqlb';
import { GraphQLClient } from 'graphql-request';

// Create query builder
const builder = createQueryBuilder();

// Define variables
const cloudId = $$<string>('cloudId');
const issueKey = $$<string>('issueKey');

// Build query with full type safety
const query = builder.query('GetIssue', q => [
  q.jira({ cloudId }, jira => [
    jira.issueByKey({ issueKey }, issue => [
      issue.key(),              // ✓ TypeScript validates this exists
      issue.summaryField(s => [ // ✓ Knows this requires selection
        s.text()                // ✓ Autocomplete for all fields
      ])
    ])
  ])
]);

// Execute with any GraphQL client
const client = new GraphQLClient('https://api.example.com/graphql');
const result = await client.request(query, {
  cloudId: 'your-cloud-id',
  issueKey: 'PROJ-123'
});

// Result is fully typed!
console.log(result.jira.issueByKey.key); // ✓ TypeScript knows this is a string

