/**
 * gqlb - Runtime proxy-based GraphQL query builder
 */

export { createQueryBuilder, createTypedQueryBuilder } from './builder.js';
export { $, $$, $vars, values } from './variables.js';
export type { QueryBuilder, SelectionFn, Variable } from './types.js';
export type { FieldSelection } from './types.js'; // Runtime FieldSelection (not generic)

// Re-export helper types for field type generation (generic versions)
export type { 
  FieldSelection as TypedFieldSelection,  // Generic marker type for generated code
  TypedVariable, 
  WithVariables 
} from './field-types-helpers.js';

// Re-export typed builder types for full type safety
export type {
  TypedQueryBuilder,
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

