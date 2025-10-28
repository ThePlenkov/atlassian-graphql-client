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
 * Query builder interface
 */
export interface QueryBuilder {
  query<T = any>(selectionFn: SelectionFn<T>): TypedDocumentNode<T, any>;
  query<T = any>(operationName: string, selectionFn: SelectionFn<T>): TypedDocumentNode<T, any>;
  mutation<T = any>(selectionFn: SelectionFn<T>): TypedDocumentNode<T, any>;
  mutation<T = any>(operationName: string, selectionFn: SelectionFn<T>): TypedDocumentNode<T, any>;
  subscription<T = any>(selectionFn: SelectionFn<T>): TypedDocumentNode<T, any>;
  subscription<T = any>(operationName: string, selectionFn: SelectionFn<T>): TypedDocumentNode<T, any>;
}

/**
 * Internal context for building queries
 */
export interface BuildContext {
  schema: GraphQLSchema;
  variables: Map<string, { type: string; required: boolean }>;
  fragments: Map<string, string>;
}

