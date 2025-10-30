/**
 * gqlb - Runtime proxy-based GraphQL query builder
 */

export { createQueryBuilder } from './builder.js';
export { $, $$, $vars, values } from './variables.js';
export type { QueryBuilder, SelectionFn, Variable } from './types.js';
export type { FieldSelection } from './types.js'; // Runtime FieldSelection (not generic)

// Re-export helper types for field type generation (generic versions)
export type { 
  FieldSelection as TypedFieldSelection,  // Generic marker type for generated code
  TypedVariable, 
  WithVariables 
} from './field-types-helpers.js';

// Re-export typed builder types from create-typed-builder
export { createTypedBuilder } from './create-typed-builder.js';
export type { TypedQueryBuilder } from './create-typed-builder.js';

