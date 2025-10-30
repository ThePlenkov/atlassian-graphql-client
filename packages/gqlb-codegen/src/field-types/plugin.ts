/**
 * GraphQL Codegen Plugin: Field Types Generator
 * 
 * Generates fully typed field definitions for use with gqlb's typed builder.
 * 
 * @example
 * ```typescript
 * // codegen.ts
 * import type { CodegenConfig } from '@graphql-codegen/cli';
 * 
 * const config: CodegenConfig = {
 *   schema: 'schema.graphql',
 *   generates: {
 *     'generated/field-types.ts': {
 *       plugins: ['gqlb-codegen/field-types'],
 *       config: {
 *         schemaTypesImportPath: './schema-types.js'
 *       }
 *     }
 *   }
 * };
 * ```
 */

import type { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { GraphQLSchema } from 'graphql';
import { generateFieldTypes, type GenerateFieldTypesOptions } from './generate.js';

export interface FieldTypesPluginConfig {
  /**
   * Import path for schema types
   * @default './schema-types.js'
   */
  schemaTypesImportPath?: string;
  
  /**
   * Import path for helper types (FieldSelection, TypedVariable, WithVariables)
   * @default 'gqlb-codegen/field-types'
   */
  helpersImportPath?: string;
}

/**
 * GraphQL Codegen plugin function
 */
export const plugin: PluginFunction<FieldTypesPluginConfig> = (
  schema: GraphQLSchema,
  _documents: Types.DocumentFile[],
  config: FieldTypesPluginConfig = {}
): string => {
  const {
    schemaTypesImportPath = './schema-types.js',
    helpersImportPath = 'gqlb-codegen/field-types'
  } = config;

  const options: GenerateFieldTypesOptions = {
    schema,
    schemaTypesImportPath,
    helpersImportPath
  };

  return generateFieldTypes(options);
};

// Default export for easier import
export default { plugin };

