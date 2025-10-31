/**
 * Helper types for generated field types
 * These are static and don't depend on the schema
 */

/**
 * Marker type for field selections
 * The generic T represents the inferred result type
 * The generic TFieldName is the field name (for array inference)
 */
export type FieldSelection<T = unknown, TFieldName extends string = string> = {
  readonly __brand: "FieldSelection";
  readonly __type?: T;
  readonly __fieldName?: TFieldName;
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

/**
 * Infer the result type from a selection (object or array)
 * This is the magic that enables automatic type inference!
 */
export type InferResultType<T> = T extends FieldSelection<infer R>
  ? R
  : T extends readonly any[]
  ? InferResultTypeFromArray<T>
  : T extends Record<string, any>
  ? { [K in keyof T]: InferResultType<T[K]> }
  : never;

/**
 * Infer result type from an array of field selections
 * This converts: [user.id, user.name] → { id: string, name: string }
 * 
 * How it works:
 * 1. T[number] gets the union of all array items
 * 2. ArrayItemResultType extracts { fieldName: type } from each FieldSelection
 * 3. UnionToIntersection merges them: { id: string } | { name: string } → { id: string, name: string }
 */
export type InferResultTypeFromArray<T extends readonly any[]> = 
  UnionToIntersection<ArrayItemResultType<T[number]>>;

/**
 * Extract result type from a single array item (FieldSelection)
 * FieldSelection<string, "id"> → { id: string }
 * FieldSelection<{ user: ... }, "user"> → { user: ... }
 */
type ArrayItemResultType<T> = T extends FieldSelection<infer TResult, infer TFieldName>
  ? TFieldName extends string
    ? { [K in TFieldName]: TResult }
    : never
  : never;

/**
 * Convert union type to intersection type
 * This merges multiple field selections into a single object
 * Example: { id: string } | { name: string } → { id: string } & { name: string }
 */
type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

/**
 * Type-safe selection that preserves the result type structure
 * This replaces the array-based ReadonlyArray<FieldSelection<unknown>>
 */
export type Selection<T> = {
  [K in keyof T]: FieldSelection<T[K]>;
};

