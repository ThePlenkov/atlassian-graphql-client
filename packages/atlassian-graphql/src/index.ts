/**
 * Atlassian GraphQL SDK
 *
 * Type-safe SDK for Atlassian's GraphQL AGG (API Gateway) with dynamic field selection.
 * Built with gqlb - a runtime proxy-based query builder.
 *
 * @example
 * ```typescript
 * import { GraphQLClient } from 'graphql-request';
 * import { createQueryBuilder, $$ } from '@your-org/atlassian-graphql';
 * 
 * const client = new GraphQLClient('https://api.atlassian.com/graphql', {
 *   headers: {
 *     authorization: `Bearer ${process.env.ATLASSIAN_TOKEN}`,
 *   },
 * });
 * 
 * // Create query builder
 * const builder = createQueryBuilder();
 * 
 * // Build queries with runtime field selection
 * const cloudId = $$<string>('cloudId');
 * const issueId = $$<string>('issueId');
 * 
 * const query = builder.query(q => [
 *   q.jira(jira => [
 *     jira.issue({ id: issueId }, issue => [
 *       issue.id(),
 *       issue.key(),
 *       issue.webUrl()
 *     ])
 *   ])
 * ]);
 * 
 * // Execute with variables
 * const result = await client.request(query, {
 *   issueId: '10000'
 * });
 * ```
 * 
 * @packageDocumentation
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { buildSchema } from 'graphql';
import { createQueryBuilder as createGqlbBuilder } from 'gqlb';

/**
 * Re-export gqlb utilities for building queries
 */
export { $, $$ } from 'gqlb';
export type { QueryBuilder, SelectionFn, FieldSelection, Variable } from 'gqlb';

/**
 * Load the filtered Atlassian GraphQL schema
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const schemaPath = join(__dirname, './generated/schema.graphql');
const schemaSDL = readFileSync(schemaPath, 'utf-8');
const schema = buildSchema(schemaSDL);

/**
 * Create a query builder for Atlassian GraphQL API
 * 
 * Returns a builder with `query`, `mutation`, and `subscription` methods.
 * Use the builder to construct GraphQL operations with runtime field selection.
 * 
 * @returns A configured QueryBuilder instance for Atlassian's API
 * 
 * @example
 * ```typescript
 * const builder = createQueryBuilder();
 * const userId = $$<string>('userId');
 * 
 * const query = builder.query(q => [
 *   q.jira(jira => [
 *     jira.issue({ id: userId }, issue => [
 *       issue.id(),
 *       issue.key()
 *     ])
 *   ])
 * ]);
 * ```
 */
export function createQueryBuilder() {
  return createGqlbBuilder(schema);
}
