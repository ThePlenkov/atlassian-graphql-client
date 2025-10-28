/**
 * Typed query builder with full TypeScript inference
 * 
 * This file defines the type system that enables full autocomplete
 * while the runtime implementation uses Proxies.
 */

import type { TypedDocumentNode } from '@graphql-typed-document-node/core';

/**
 * Extract the selection type from a field
 */
export type SelectionOf<T> = T extends FieldFn<infer S, any, any> ? S : never;

/**
 * A field function that can be called with args and/or selection
 */
export type FieldFn<TSelection, TArgs = {}, TRequired extends boolean = false> =
  // Scalar field (no args, no selection)
  [TArgs] extends [never]
    ? [TSelection] extends [Scalar]
      ? () => TSelection
      : never
  // Scalar field with args
  : [TSelection] extends [Scalar]
    ? TRequired extends true
      ? (args: TArgs) => TSelection
      : (args?: TArgs) => TSelection
  // Object field (no args, requires selection)
  : [TArgs] extends [never]
    ? <S extends Selection<TSelection>>(select: (t: TSelection) => S) => Narrow<TSelection, S>
  // Object field with args and selection
  : TRequired extends true
    ? <S extends Selection<TSelection>>(args: TArgs, select: (t: TSelection) => S) => Narrow<TSelection, S>
    : <S extends Selection<TSelection>>(args: TArgs | ((t: TSelection) => S), select?: (t: TSelection) => S) => Narrow<TSelection, S>;

/**
 * Scalar types that don't require selections
 */
export type Scalar = string | number | boolean | null | undefined;

/**
 * A selection is an array of field results
 */
export type Selection<T> = ReadonlyArray<T[keyof T]>;

/**
 * Narrow a type based on selected fields
 */
export type Narrow<T, S extends Selection<T>> = {
  [K in keyof T as S[number] extends T[K] ? K : never]: T[K] extends FieldFn<infer TSelection, any, any>
    ? TSelection extends Scalar
      ? TSelection
      : S[number] extends T[K]
        ? TSelection
        : never
    : never;
};

/**
 * Typed query builder interface
 */
export interface TypedQueryBuilder<TQuery, TMutation = unknown, TSubscription = unknown> {
  /**
   * Build a query operation
   */
  query<S extends Selection<TQuery>>(
    select: (q: TQuery) => S
  ): TypedDocumentNode<Narrow<TQuery, S>, Record<string, any>>;

  query<S extends Selection<TQuery>>(
    operationName: string,
    select: (q: TQuery) => S
  ): TypedDocumentNode<Narrow<TQuery, S>, Record<string, any>>;

  /**
   * Build a mutation operation
   */
  mutation<S extends Selection<TMutation>>(
    select: (m: TMutation) => S
  ): TypedDocumentNode<Narrow<TMutation, S>, Record<string, any>>;

  mutation<S extends Selection<TMutation>>(
    operationName: string,
    select: (m: TMutation) => S
  ): TypedDocumentNode<Narrow<TMutation, S>, Record<string, any>>;

  /**
   * Build a subscription operation
   */
  subscription<S extends Selection<TSubscription>>(
    select: (s: TSubscription) => S
  ): TypedDocumentNode<Narrow<TSubscription, S>, Record<string, any>>;

  subscription<S extends Selection<TSubscription>>(
    operationName: string,
    select: (s: TSubscription) => S
  ): TypedDocumentNode<Narrow<TSubscription, S>, Record<string, any>>;
}

/**
 * Variable reference for typed queries
 */
export interface TypedVariable<T> {
  readonly __brand: 'Variable';
  readonly name: string;
  readonly required: boolean;
  readonly type?: T;
}

/**
 * Create a required variable
 */
export function $$<T>(name: string): TypedVariable<T> {
  return {
    __brand: 'Variable',
    name,
    required: true,
    type: undefined as T,
  };
}

/**
 * Create an optional variable
 */
export function $<T>(name: string): TypedVariable<T | null> {
  return {
    __brand: 'Variable',
    name,
    required: false,
    type: undefined as T | null,
  };
}

/**
 * Example usage:
 * 
 * ```typescript
 * interface Query {
 *   user: FieldFn<User, { id: string }, true>;
 *   users: FieldFn<User[], never, false>;
 * }
 * 
 * interface User {
 *   id: FieldFn<string, never, false>;
 *   name: FieldFn<string, never, false>;
 *   email: FieldFn<string | null, never, false>;
 *   posts: FieldFn<Post[], { first?: number }, false>;
 * }
 * 
 * interface Post {
 *   title: FieldFn<string, never, false>;
 *   content: FieldFn<string, never, false>;
 * }
 * 
 * const builder: TypedQueryBuilder<Query> = createQueryBuilder(schema);
 * 
 * // Full autocomplete!
 * const query = builder.query(q => [
 *   q.user({ id: '123' }, user => [
 *     user.id(),
 *     user.name(),
 *     user.posts({ first: 10 }, post => [
 *       post.title(),
 *       post.content()
 *     ])
 *   ])
 * ]);
 * 
 * // Result type is inferred as:
 * // {
 * //   user: {
 * //     id: string;
 * //     name: string;
 * //     posts: {
 * //       title: string;
 * //       content: string;
 * //     }[];
 * //   }
 * // }
 * ```
 */



