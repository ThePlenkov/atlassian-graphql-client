/**
 * TypeScript utility types for transforming GraphQL types into FieldFn types
 * 
 * This allows us to use standard GraphQL Codegen output and transform it
 * using the full power of TypeScript's type system!
 */

import type { FieldFn } from './typed-builder.js';

/**
 * Check if a type is an object type (not scalar, array, or null)
 */
type IsObject<T> = T extends object
  ? T extends any[]
    ? false
    : T extends Date
      ? false
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      : T extends Function
        ? false
        : true
  : false;

/**
 * Check if a type is nullable (includes null or undefined)
 */
type IsNullable<T> = null extends T ? true : undefined extends T ? true : false;

/**
 * Get the non-null version of a type
 */
type NonNullable<T> = T extends null | undefined ? never : T;

/**
 * Transform a GraphQL type into a FieldFn type
 * 
 * Rules:
 * - Scalars: FieldFn<T, never, false>
 * - Objects: FieldFn<ToFields<T>, never, false>
 * - Arrays: Recursively transform element type
 * - Nullable: Include null in return type
 */
export type ToFieldFn<T> = 
  // Handle arrays
  T extends (infer U)[]
    ? FieldFn<ToFieldFn<U>[], never, false>
  // Handle nullable types
  : IsNullable<T> extends true
    ? FieldFn<ToFieldFn<NonNullable<T>> | null, never, false>
  // Handle objects (need nested Fields transformation)
  : IsObject<T> extends true
    ? FieldFn<ToFields<T>, never, false>
  // Handle scalars
  : FieldFn<T, never, false>;

/**
 * Transform all properties of an object type into FieldFn types
 * 
 * @example
 * ```typescript
 * // Input (from GraphQL Codegen)
 * interface User {
 *   id: string;
 *   name: string;
 *   email?: string | null;
 *   posts: Post[];
 * }
 * 
 * // Output (after ToFields)
 * interface UserFields {
 *   id: FieldFn<string, never, false>;
 *   name: FieldFn<string, never, false>;
 *   email: FieldFn<string | null, never, false>;
 *   posts: FieldFn<PostFields[], never, false>;
 * }
 * ```
 */
export type ToFields<T> = {
  [K in keyof T]: ToFieldFn<T[K]>;
};

/**
 * Extract Args type for a field if it exists
 * GraphQL Codegen generates Args types like: QueryFieldArgs, JiraQueryissueByKeyArgs
 */
type ExtractArgs<TRoot, K extends keyof TRoot> = 
  // Look for a type named [RootTypeName][FieldName]Args in the same scope
  // For now, we can't dynamically look up types, so we default to never
  // Users will need to manually cast or we generate a mapping
  never;

/**
 * Transform a Query/Mutation/Subscription root type
 * 
 * This transforms fields to FieldFn types, but Args handling requires
 * a different approach since GraphQL Codegen generates separate Args types
 */
export type ToRootFields<T> = {
  [K in keyof T]: ToFieldFn<T[K]>;
};

/**
 * Extract field types from generated GraphQL types
 * 
 * This is a convenience type that looks for the "Fields" suffix convention
 */
export type FieldsOf<T> = T extends { __typename?: string }
  ? ToFields<Omit<T, '__typename'>>
  : ToFields<T>;

/**
 * Example usage:
 * 
 * ```typescript
 * // 1. Generate base types with @graphql-codegen/typescript
 * interface Query {
 *   user: User;
 *   users: User[];
 * }
 * 
 * interface User {
 *   id: string;
 *   name: string;
 *   email?: string | null;
 *   posts: Post[];
 * }
 * 
 * interface Post {
 *   id: string;
 *   title: string;
 *   content: string;
 * }
 * 
 * // 2. Transform with utility types
 * type QueryFields = ToFields<Query>;
 * type UserFields = ToFields<User>;
 * type PostFields = ToFields<Post>;
 * 
 * // 3. Use with typed builder
 * const builder: TypedQueryBuilder<QueryFields> = createQueryBuilder(schema);
 * 
 * // 4. Full autocomplete!
 * const query = builder.query(q => [
 *   q.user(user => [
 *     user.id,
 *     user.name,
 *     user.posts(post => [
 *       post.title
 *     ])
 *   ])
 * ]);
 * ```
 */



