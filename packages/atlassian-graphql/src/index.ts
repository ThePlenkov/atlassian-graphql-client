/**
 * Atlassian GraphQL SDK
 *
 * Type-safe SDK for Atlassian's GraphQL AGG (API Gateway) with dynamic field selection.
 * Built with gqlb - a runtime proxy-based query builder with FULL TypeScript type safety.
 *
 * @example
 * ```typescript
 * import { createQueryBuilder, $$ } from '@atlassian-tools/gql';
 * import { GraphQLClient } from 'graphql-request';
 * 
 * const client = new GraphQLClient('https://your-company.atlassian.net/gateway/api/graphql', {
 *   headers: {
 *     authorization: `Bearer ${process.env.ATLASSIAN_TOKEN}`,
 *   },
 * });
 * 
 * // Create fully-typed query builder
 * const builder = createQueryBuilder();
 * 
 * // Build queries with FULL autocomplete - TypeScript knows all fields!
 * const cloudId = $$<string>('cloudId');
 * const issueKey = $$<string>('issueKey');
 * 
 * const query = builder.query('GetJiraIssue', q => [
 *   q.jira({ cloudId }, jira => [
 *     jira.issueByKey({ issueKey }, issue => [
 *       issue.key,
 *       issue.summaryField(s => [s.text]),
 *       issue.assigneeField(a => [
 *         a.user(user => [
 *           user.name
 *         ])
 *       ])
 *     ])
 *   ])
 * ]);
 * 
 * // Execute with variables - result is fully typed!
 * const result = await client.request(query, {
 *   cloudId: 'your-cloud-id',
 *   issueKey: 'PROJ-123'
 * });
 * 
 * // TypeScript knows the exact shape:
 * console.log(result.jira.issueByKey.key);  // ✓ string
 * console.log(result.jira.issueByKey.summaryField.text);  // ✓ string
 * ```
 * 
 * @packageDocumentation
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { buildSchema } from 'graphql';
import { createQueryBuilder as createGqlbBuilder } from 'gqlb';
import type { QueryBuilder } from 'gqlb';
import type { QueryFields, MutationFields } from './generated/field-types.js';

/**
 * Re-export gqlb utilities for building queries
 */
export { $, $$, $vars, values } from 'gqlb';
export type { 
  QueryBuilder, 
  SelectionFn, 
  FieldSelection, 
  Variable
} from 'gqlb';

/**
 * Re-export generated types for external use
 */
export type * from './generated/schema-types.js';
export type { QueryFields, MutationFields } from './generated/field-types.js';

/**
 * Load the filtered Atlassian GraphQL schema
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const schemaPath = join(__dirname, './generated/schema.graphql');
const schemaSDL = readFileSync(schemaPath, 'utf-8');
const schema = buildSchema(schemaSDL);

/**
 * Create a fully-typed query builder for Atlassian GraphQL API
 * 
 * Returns a builder with `query`, `mutation`, and `subscription` methods.
 * The builder provides FULL TypeScript autocomplete for all Atlassian API fields.
 * 
 * @returns A fully-typed QueryBuilder instance for Atlassian's API
 * 
 * @example
 * ```typescript
 * const builder = createQueryBuilder();
 * const cloudId = $$<string>('cloudId');
 * const issueKey = $$<string>('issueKey');
 * 
 * // TypeScript knows ALL available fields and provides autocomplete!
 * const query = builder.query('GetIssue', q => [
 *   q.jira({ cloudId }, jira => [
 *     jira.issueByKey({ issueKey }, issue => [
 *       issue.key,                // ✓ TypeScript knows this exists
 *       issue.summaryField(s => [  // ✓ TypeScript knows this requires selection
 *         s.text                   // ✓ TypeScript knows text field exists
 *       ])
 *     ])
 *   ])
 * ]);
 * 
 * // Result type is fully inferred!
 * // TypeScript knows: result.jira.issueByKey.key is string
 * //                  result.jira.issueByKey.summaryField.text is string
 * ```
 */
export function createQueryBuilder(): QueryBuilder {
  return createGqlbBuilder<QueryFields, MutationFields>(schema);
}

/**
 * Type alias for the fully-typed Atlassian query builder
 * Use this when you need to explicitly type a builder variable
 * 
 * @example
 * ```typescript
 * const builder: AtlassianQueryBuilder = createQueryBuilder();
 * ```
 */
export type AtlassianQueryBuilder = QueryBuilder;
