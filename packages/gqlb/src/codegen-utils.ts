/**
 * TypeScript utility types for creating type-safe GraphQL schema configurations
 * 
 * These utilities help create configuration files (like sdk.config.ts) that are
 * fully typed against a GraphQL schema, providing autocomplete and type safety.
 * 
 * @example
 * ```typescript
 * // Import full schema types (generated from complete schema)
 * import type { Query, Mutation } from './generated/schema-types.full.ts';
 * import type { SchemaConfig } from 'gqlb/codegen';
 * 
 * // Create fully typed configuration
 * const config: SchemaConfig<Query, Mutation> = {
 *   Query: {
 *     jira: {
 *       issueByKey: true,        // ✅ Autocompleted!
 *       issueSearchStable: true, // ✅ Autocompleted!
 *       invalidOp: true,         // ❌ TypeScript error!
 *     }
 *   },
 *   Mutation: {
 *     jira: {
 *       createIssueLinks: true,  // ✅ Autocompleted!
 *     }
 *   }
 * } satisfies SchemaConfig<Query, Mutation>;
 * ```
 */

/**
 * Extract the underlying type from a Maybe type
 * 
 * GraphQL types are often wrapped in Maybe<T> which is T | null.
 * This utility unwraps that to get the actual type.
 * 
 * @example
 * ```typescript
 * type A = UnwrapMaybe<User | null>;        // User
 * type B = UnwrapMaybe<User | undefined>;   // User
 * type C = UnwrapMaybe<User>;               // User
 * ```
 */
export type UnwrapMaybe<T> = T extends null | undefined 
  ? never 
  : Exclude<T, null | undefined>;

/**
 * Configuration for a single root type (Query, Mutation, or Subscription)
 * 
 * Maps module names (like 'jira', 'confluence') to their operations.
 * Each operation can be enabled by setting it to `true`.
 * 
 * @template TRoot - The root type (Query, Mutation, or Subscription)
 * 
 * @example
 * ```typescript
 * // For Query root type with structure:
 * // type Query = {
 * //   jira?: Maybe<JiraQuery>;
 * //   confluence?: Maybe<ConfluenceQuery>;
 * // }
 * //
 * // type JiraQuery = {
 * //   issueByKey?: Maybe<Issue>;
 * //   project?: Maybe<Project>;
 * // }
 * 
 * type Config = ModuleConfig<Query>;
 * 
 * // Results in:
 * // {
 * //   jira?: {
 * //     issueByKey?: true;
 * //     project?: true;
 * //   };
 * //   confluence?: {
 * //     page?: true;
 * //     space?: true;
 * //   };
 * // }
 * ```
 */
export type ModuleConfig<TRoot> = {
  [TModule in keyof TRoot]?: {
    [TOperation in keyof UnwrapMaybe<TRoot[TModule]>]?: true;
  };
};

/**
 * Full schema configuration type for GraphQL schema filtering
 * 
 * Use this to create type-safe configuration files that specify which
 * GraphQL operations to include in your filtered schema.
 * 
 * @template TQuery - Query root type from your GraphQL schema
 * @template TMutation - Mutation root type from your GraphQL schema (optional)
 * @template TSubscription - Subscription root type from your GraphQL schema (optional)
 * 
 * @example
 * ```typescript
 * import type { Query, Mutation } from './schema-types.full.ts';
 * 
 * const config: SchemaConfig<Query, Mutation> = {
 *   Query: {
 *     users: {
 *       userById: true,
 *       searchUsers: true,
 *     }
 *   },
 *   Mutation: {
 *     users: {
 *       createUser: true,
 *       updateUser: true,
 *     }
 *   }
 * } satisfies SchemaConfig<Query, Mutation>;
 * ```
 */
export type SchemaConfig<
  TQuery = never,
  TMutation = never,
  TSubscription = never
> = {
  Query?: [TQuery] extends [never] ? never : ModuleConfig<TQuery>;
  Mutation?: [TMutation] extends [never] ? never : ModuleConfig<TMutation>;
  Subscription?: [TSubscription] extends [never] ? never : ModuleConfig<TSubscription>;
};

/**
 * Helper type for creating module-level configurations
 * 
 * Useful when you want to configure a specific module separately
 * and then combine multiple module configs.
 * 
 * @template TModule - The module type (e.g., JiraQuery, ConfluenceQuery)
 * 
 * @example
 * ```typescript
 * import type { JiraQuery } from './schema-types.full.ts';
 * 
 * const jiraConfig: ModuleOperations<JiraQuery> = {
 *   issueByKey: true,
 *   project: true,
 *   board: true,
 * };
 * ```
 */
export type ModuleOperations<TModule> = {
  [TOperation in keyof UnwrapMaybe<TModule>]?: true;
};

/**
 * Type guard to check if a configuration is valid
 * 
 * While TypeScript provides compile-time checking, this can be used
 * at runtime to validate dynamically loaded configurations.
 * 
 * @param config - Configuration object to validate
 * @returns True if the configuration structure is valid
 * 
 * @example
 * ```typescript
 * const config = loadConfig(); // loaded from file
 * 
 * if (isValidSchemaConfig(config)) {
 *   // TypeScript now knows config has the right shape
 *   processConfig(config);
 * }
 * ```
 */
export function isValidSchemaConfig(config: unknown): config is SchemaConfig {
  if (typeof config !== 'object' || config === null) {
    return false;
  }
  
  const cfg = config as Record<string, unknown>;
  
  // Check that only valid root keys exist
  for (const key of Object.keys(cfg)) {
    if (key !== 'Query' && key !== 'Mutation' && key !== 'Subscription') {
      return false;
    }
    
    const rootConfig = cfg[key];
    if (typeof rootConfig !== 'object' || rootConfig === null) {
      return false;
    }
    
    // Check that module configs only contain boolean true values
    for (const moduleConfig of Object.values(rootConfig)) {
      if (typeof moduleConfig !== 'object' || moduleConfig === null) {
        return false;
      }
      
      for (const value of Object.values(moduleConfig)) {
        if (value !== true) {
          return false;
        }
      }
    }
  }
  
  return true;
}

/**
 * Extract operation names from a module configuration
 * 
 * Helper function to get a list of enabled operations from a module config.
 * Useful for logging, debugging, or runtime processing.
 * 
 * @param moduleConfig - Configuration for a specific module
 * @returns Array of enabled operation names
 * 
 * @example
 * ```typescript
 * const jiraConfig = {
 *   issueByKey: true,
 *   project: true,
 * };
 * 
 * const operations = getEnabledOperations(jiraConfig);
 * // ['issueByKey', 'project']
 * ```
 */
export function getEnabledOperations(
  moduleConfig: Record<string, true | undefined>
): string[] {
  return Object.entries(moduleConfig)
    .filter(([, enabled]) => enabled === true)
    .map(([name]) => name);
}

/**
 * Count total number of enabled operations across all modules
 * 
 * @param config - Schema configuration
 * @returns Object with counts per root type
 * 
 * @example
 * ```typescript
 * const stats = countOperations(config);
 * // { Query: 5, Mutation: 3, Subscription: 0, total: 8 }
 * ```
 */
export function countOperations(config: SchemaConfig): {
  Query: number;
  Mutation: number;
  Subscription: number;
  total: number;
} {
  const counts = { Query: 0, Mutation: 0, Subscription: 0, total: 0 };
  
  for (const [rootType, modules] of Object.entries(config)) {
    if (rootType === 'Query' || rootType === 'Mutation' || rootType === 'Subscription') {
      if (modules && typeof modules === 'object') {
        for (const moduleConfig of Object.values(modules)) {
          if (moduleConfig && typeof moduleConfig === 'object') {
            const ops = getEnabledOperations(moduleConfig as Record<string, true>);
            counts[rootType] += ops.length;
            counts.total += ops.length;
          }
        }
      }
    }
  }
  
  return counts;
}

