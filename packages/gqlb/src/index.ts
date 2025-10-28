/**
 * gqlb - Runtime proxy-based GraphQL query builder
 */

export { createQueryBuilder } from './builder.js';
export { $, $$ } from './variables.js';
export type { QueryBuilder, SelectionFn, FieldSelection, Variable } from './types.js';

// Re-export typed builder types for full type safety
export type {
  TypedQueryBuilder,
  TypedVariable,
  FieldFn,
  Selection,
  Scalar,
  SelectionOf,
  Narrow
} from './typed-builder.js';

// Re-export utility types for transforming standard codegen output
export type {
  ToFields,
  ToFieldFn,
  ToRootFields,
  FieldsOf
} from './type-utils.js';

