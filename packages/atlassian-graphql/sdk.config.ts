/**
 * SDK Configuration - defines which GraphQL operations to include
 * 
 * This config is used by filter-schema.ts to prune the full Atlassian schema
 * down to only the operations we actually use, reducing bundle size.
 * 
 * Uses type utilities from gqlb/codegen for full type safety and autocomplete.
 * 
 * Structure:
 * {
 *   Query: {
 *     [moduleName]: {
 *       [operationName]: true
 *     }
 *   },
 *   Mutation: { ... }
 * }
 */

import type { Query, Mutation } from './src/generated/schema-types.full.ts';
import type { SchemaConfig } from 'gqlb/codegen';

/**
 * SDK Configuration type with full autocomplete support
 * 
 * Provides type-safe configuration with:
 * - Autocomplete for module names (Query.jira, Mutation.jira, etc.)
 * - Autocomplete for operation names (issueByKey, createIssueLinks, etc.)
 * - Compile-time validation of module and operation names
 * 
 * Example:
 * ```ts
 * const config: SDKConfig = {
 *   Query: {
 *     jira: {
 *       issueByKey: true,      // ✅ Valid - autocompleted
 *       invalidOp: true,       // ❌ Type error!
 *     },
 *     invalidModule: {},       // ❌ Type error!
 *   }
 * };
 * ```
 */
export type SDKConfig = SchemaConfig<Query, Mutation>;

/**
 * Typed SDK configuration
 * 
 * Each operation is explicitly marked as enabled (true) or can be commented out.
 * TypeScript ensures:
 * - Only valid module names can be used (jira, confluence, etc.)
 * - Only valid operation names for each module
 * - Autocomplete works in your IDE!
 */
const config: SDKConfig = {
  Query: {
    // Jira operations
    jira: {
      // Issue operations
      issueByKey: true,
      issueSearchStable: true,
      
      // Add more Jira operations as needed - autocomplete will show available options!
      // issue: true,
      // project: true,
      // board: true,
    },
    
    // Confluence operations (add when needed)
    // confluence: {
    //   page: true,
    //   space: true,
    // },
  },
  
  // Mutations
  Mutation: {
    // Jira mutations
    jira: {
      // Issue link mutations
      createIssueLinks: true,
      deleteIssueLink: true,
      
      // Add more mutations as needed - autocomplete will show available options!
      // createIssue: true,
      // updateIssue: true,
    }
  }
} satisfies SDKConfig;

export default config;

