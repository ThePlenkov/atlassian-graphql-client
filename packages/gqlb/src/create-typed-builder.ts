/**
 * Create a fully typed query builder wrapper
 * 
 * This provides compile-time type safety while using the runtime proxy builder
 */

import type { GraphQLSchema } from 'graphql';
import { createQueryBuilder } from './builder.js';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import type { FieldSelection } from './field-types-helpers.js';

/**
 * Typed query builder interface
 */
export interface TypedQueryBuilder<TQueryFields, TMutationFields = never> {
  query(
    select: (q: TQueryFields) => ReadonlyArray<FieldSelection>
  ): TypedDocumentNode;
  
  query(
    operationName: string,
    select: (q: TQueryFields) => ReadonlyArray<FieldSelection>
  ): TypedDocumentNode;
  
  mutation(
    select: (m: TMutationFields) => ReadonlyArray<FieldSelection>
  ): TypedDocumentNode;
  
  mutation(
    operationName: string,
    select: (m: TMutationFields) => ReadonlyArray<FieldSelection>
  ): TypedDocumentNode;
}

/**
 * Create a typed query builder
 * 
 * @example
 * ```typescript
 * import { createTypedBuilder } from 'gqlb/typed';
 * import type { QueryFields, MutationFields } from './generated/field-types';
 * import { schema } from './schema';
 * 
 * const builder = createTypedBuilder<QueryFields, MutationFields>(schema);
 * 
 * // Fully typed!
 * const query = builder.query(q => [
 *   q.user({ id: '123' }, user => [
 *     user.id,
 *     user.name
 *   ])
 * ]);
 * ```
 */
export function createTypedBuilder<TQueryFields, TMutationFields = never>(
  schema: GraphQLSchema
): TypedQueryBuilder<TQueryFields, TMutationFields> {
  const runtimeBuilder = createQueryBuilder(schema);
  
  // Cast runtime builder to typed interface
  // The runtime builder is structurally compatible - we just add type information
  return runtimeBuilder as unknown as TypedQueryBuilder<TQueryFields, TMutationFields>;
}

