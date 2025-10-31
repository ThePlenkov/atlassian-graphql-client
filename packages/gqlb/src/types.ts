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
 * NOW returns an object where keys are field names and values are FieldSelections
 * This enables automatic type inference!
 */
export type SelectionFn<T = any, TResult = any> = (proxy: T) => TResult;

/**
 * A field selection (scalar, object, or nested) - internal representation
 */
export interface FieldSelection {
  name: string;
  alias?: string;
  args?: Record<string, any>;
  selection?: FieldSelection[];
}

// Import InferResultType for use in OperationBuilder
import type { InferResultType } from './field-types-helpers.js';

/**
 * Operation builder that supports both function calls and proxy property access
 * - builder.query(q => ({...})) - anonymous operation with object selection
 * - builder.query('Name', q => ({...})) - named operation (backward compatible)
 * - builder.query.Name(q => ({...})) - named operation (fluent API)
 * 
 * The result type is automatically inferred from the selection object!
 */
export type OperationBuilder<T = any> = {
  <TSelection>(selectionFn: SelectionFn<T, TSelection>): TypedDocumentNode<InferResultType<TSelection>, any>;
  <TSelection>(operationName: string, selectionFn: SelectionFn<T, TSelection>): TypedDocumentNode<InferResultType<TSelection>, any>;
  // Index signature for proxy property access (builder.query.Name)
  [operationName: string]: <TSelection>(selectionFn: SelectionFn<T, TSelection>) => TypedDocumentNode<InferResultType<TSelection>, any>;
};

/**
 * Query builder interface
 */
export interface QueryBuilder<TQueryFields = any, TMutationFields = any> {
  query: OperationBuilder<TQueryFields>;
  mutation: OperationBuilder<TMutationFields>;
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

