/**
 * Typed field definitions for Atlassian GraphQL API
 * 
 * Uses TypeScript utility types to transform generated schema types
 * into builder-compatible types with proper type safety.
 * 
 * Auto-detects *Args types and injects them automatically!
 */

import type { FieldFn, Variable } from 'gqlb';
import type { Query, JiraQuery } from './generated/schema-types.js';
import type { ArgsTypeMap } from './generated/args-map.js';

/**
 * Make all properties accept Variable<T> | T
 */
type WithVariables<T> = {
  [K in keyof T]: T[K] | Variable<T[K]>;
};

/**
 * Remove null and undefined from a type
 */
type NonNullable<T> = T extends null | undefined ? never : T;

/**
 * Check if the non-nullable version of a type is a scalar
 */
type IsScalar<T> = 
  NonNullable<T> extends string | number | boolean ? true : false;

/**
 * Try to find Args type for a field using our Args type map
 */
type GetArgsType<TParent extends string, TField extends string | number | symbol> = 
  TField extends string
    ? `${TParent}${TField}Args` extends keyof ArgsTypeMap
      ? ArgsTypeMap[`${TParent}${TField}Args`]
      : never
    : never;

/**
 * Narrow type based on selection (from gqlb)
 */
type Narrow<T, S> = any;  // Simplified for now

/**
 * Selection array type (from gqlb)
 */
type Selection<T> = ReadonlyArray<T[keyof T]>;

/**
 * Infer the type name for known types, otherwise use generic string
 * This allows args detection to work for nested types
 */
type InferTypeName<T> =
  T extends Query ? 'Query' :
  T extends JiraQuery ? 'JiraQuery' :
  string;

/**
 * Build field selector - returns the function type matching FieldFn from gqlb
 * [TField] prevents distribution over union types
 * 
 * For nested types, we recursively apply ToFields<T, string>
 * Args are only detected for known parent types (Query, JiraQuery, etc.)
 */
type BuildFieldSelector<TField, TParent extends string, TFieldName extends string | number | symbol> =
  [TField] extends [infer T]
    ? [IsScalar<T>] extends [true]
      // Scalar: just the value type (property access)
      ? T
      // Array: recursively transform item type with inferred name
      : [NonNullable<T>] extends [Array<infer TItem>]
        ? <S extends Selection<ToFields<NonNullable<TItem>, InferTypeName<NonNullable<TItem>>>>>(select: (fields: ToFields<NonNullable<TItem>, InferTypeName<NonNullable<TItem>>>) => S) => Array<Narrow<NonNullable<TItem>, S>> | Extract<T, null | undefined>
        // Object: check if it has args
        : [GetArgsType<TParent, TFieldName>] extends [never]
          // No args: just selection with inferred type name
          ? <S extends Selection<ToFields<NonNullable<T>, InferTypeName<NonNullable<T>>>>>(select: (fields: ToFields<NonNullable<T>, InferTypeName<NonNullable<T>>>) => S) => Narrow<NonNullable<T>, S> | Extract<T, null | undefined>
          // Has args: args + selection with inferred type name
          : <S extends Selection<ToFields<NonNullable<T>, InferTypeName<NonNullable<T>>>>>(args: WithVariables<GetArgsType<TParent, TFieldName>>, select: (fields: ToFields<NonNullable<T>, InferTypeName<NonNullable<T>>>) => S) => Narrow<NonNullable<T>, S> | Extract<T, null | undefined>
    : never;

/**
 * Transform all fields of an object type
 * -? removes optional modifiers - all field selectors are always available
 */
type ToFields<T, TName extends string> = {
  [K in keyof T]-?: BuildFieldSelector<T[K], TName, K>;
};

/**
 * Transform Query root type
 * 
 * Args are auto-detected for Query fields (e.g., JiraQueryissueByKeyArgs)
 * Nested types are transformed recursively using ToFields<T, string>
 */
export type QueryFields = ToFields<Query, 'Query'>;

/**
 * Mutation and Subscription types (add when sdk.config.ts includes them)
 * Currently not generated as we only have Query.jira operations
 */
// export type MutationFields = ToFields<Mutation, 'Mutation'>;
// export type SubscriptionFields = ToFields<Subscription, 'Subscription'>;

/**
 * Re-export all generated schema types for external use
 */
export type * from './generated/schema-types.js';
