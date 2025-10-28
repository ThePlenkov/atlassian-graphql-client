import type { Variable } from './types.js';

/**
 * Create a GraphQL variable (optional)
 * 
 * @example
 * const userId = $<string>('userId')
 * const query = builder.query(q => q.user({ id: userId }, ...))
 */
export function $<T = any>(name: string): Variable<T | null | undefined> {
  return {
    __brand: 'Variable',
    name,
    required: false,
  } as Variable<T | null | undefined>;
}

/**
 * Create a required GraphQL variable
 * 
 * @example
 * const userId = $$<string>('userId')
 * const query = builder.query(q => q.user({ id: userId }, ...))
 */
export function $$<T = any>(name: string): Variable<T> {
  return {
    __brand: 'Variable',
    name,
    required: true,
  } as Variable<T>;
}

/**
 * Check if a value is a Variable
 */
export function isVariable(value: any): value is Variable {
  return value && typeof value === 'object' && value.__brand === 'Variable';
}

