/**
 * Example of using gqlb with Atlassian GraphQL schema
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { buildSchema } from 'graphql';
import { createQueryBuilder, $$ } from '../../gqlb/src/index';

// Load the filtered Atlassian schema
const schemaPath = join(__dirname, '../src/generated/schema.graphql');
const schemaSDL = readFileSync(schemaPath, 'utf-8');
const schema = buildSchema(schemaSDL);

// Create query builder
const builder = createQueryBuilder(schema);

// Example: Query Jira issue with dynamic field selection
const cloudId = $$<string>('cloudId');
const issueKey = $$<string>('issueKey');

const issueQuery = builder.query(q => [
  q.jira(jira => [
    jira.issue({ id: '12345' }, issue => [
      issue.id(),
      issue.key(),
      issue.issueId(),
      issue.webUrl()
    ])
  ])
]);

console.log('Generated Jira Query:');
console.log(issueQuery.loc?.source.body);
console.log('\n---\n');

// Example: Query with variable
const idVar = $$<string>('issueId');
const simpleQuery = builder.query(q => [
  q.jira(jira => [
    jira.issue({ id: idVar }, issue => [
      issue.id(),
      issue.key()
    ])
  ])
]);

console.log('Simple Query:');
console.log(simpleQuery.loc?.source.body);

