import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import type { GraphQLSchema } from 'graphql';

/**
 * A GraphQL variable reference
 */
export interface Variable<T = any> {
  readonly __brand: 'Variable';
  readonly name: string;
  readonly required: boolean;
  readonly type?: T;
  readonly value?: T;  // Optional: stores the actual value when using $vars()
}

/**
 * Function that selects fields from a type
 */
export type SelectionFn<T = any> = (proxy: any) => FieldSelection[];

/**
 * A field selection (scalar, object, or nested)
 */
export interface FieldSelection {
  name: string;
  alias?: string;
  args?: Record<string, any>;
  selection?: FieldSelection[];
}

/**
 * Operation builder that supports both function calls and proxy property access
 * - builder.query(q => [...]) - anonymous operation
 * - builder.query('Name', q => [...]) - named operation (backward compatible)
 * - builder.query.Name(q => [...]) - named operation (fluent API)
 */
export type OperationBuilder<T = any> = {
  (selectionFn: SelectionFn<T>): TypedDocumentNode<T, any>;
  (operationName: string, selectionFn: SelectionFn<T>): TypedDocumentNode<T, any>;
  // Index signature for proxy property access (builder.query.Name)
  [operationName: string]: (selectionFn: SelectionFn<T>) => TypedDocumentNode<T, any>;
};

/**
 * Query builder interface
 */
export interface QueryBuilder {
  query: OperationBuilder;
  mutation: OperationBuilder;
  subscription: OperationBuilder;
}

/**
 * Internal context for building queries
 */
export interface BuildContext {
  schema: GraphQLSchema;
  variables: Map<string, { type: string; required: boolean }>;
  fragments: Map<string, string>;
}

