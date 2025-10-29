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
 * Create multiple GraphQL variables from values
 * The schema determines if they're required or optional automatically
 * 
 * @example
 * const vars = $vars({
 *   userId: '123',
 *   limit: 10,
 *   filter: { status: 'active' }
 * });
 * 
 * const { userId, limit, filter } = vars;
 * const query = builder.query(q => q.users({ userId, limit, filter }, ...))
 * 
 * // Execute with the values
 * client.request(query, vars)
 */
export function $vars<T extends Record<string, any>>(values: T): { [K in keyof T]: Variable<T[K]> } {
  const variables = {} as any;
  
  for (const [key, value] of Object.entries(values)) {
    variables[key] = {
      __brand: 'Variable',
      name: key,
      required: true, // Schema will determine actual required/optional
      value: value,   // Store the actual value for execution
    } as Variable<any>;
  }
  
  return variables;
}

/**
 * Check if a value is a Variable
 */
export function isVariable(value: any): value is Variable {
  return value && typeof value === 'object' && value.__brand === 'Variable';
}

/**
 * Extract values from $vars() variables for query execution
 * 
 * @example
 * const vars = $vars({ userId: '123', limit: 10 });
 * const query = builder.query(...);
 * 
 * // Extract values for execution
 * const result = await client.request(query, values(vars));
 */
export function values<T extends Record<string, Variable<any>>>(variables: T): { [K in keyof T]: T[K] extends Variable<infer V> ? V : never } {
  const result = {} as any;
  
  for (const [key, variable] of Object.entries(variables)) {
    if (isVariable(variable) && variable.value !== undefined) {
      result[key] = variable.value;
    }
  }
  
  return result;
}

