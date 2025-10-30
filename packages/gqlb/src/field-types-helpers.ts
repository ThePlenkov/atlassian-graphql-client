/**
 * Helper types for generated field types
 * These are static and don't depend on the schema
 */

/**
 * Marker type for field selections
 * The generic T represents the inferred result type
 */
export type FieldSelection<T = unknown> = {
  readonly __brand: "FieldSelection";
  readonly __type?: T;
};

/**
 * Variable reference type (from typed-builder)
 */
export type TypedVariable<T> = {
  readonly __brand: "Variable";
  readonly name: string;
  readonly required: boolean;
  readonly type?: T;
};

/**
 * Make arguments accept TypedVariable
 * Deep recursively transforms T to allow TypedVariable<unknown> for each property
 * This allows both $ (optional) and $$ (required) variables
 */
export type WithVariables<T> = T extends object
  ? { [K in keyof T]: T[K] | TypedVariable<unknown> | (T[K] extends object ? WithVariables<T[K]> : never) }
  : T | TypedVariable<unknown>;

