/**
 * GraphQL Codegen Plugin: Args Map Generator
 * 
 * Generates a TypeScript interface mapping Args type names to their types,
 * including only Args types present in the schema for optimal tree-shaking.
 * 
 * @example
 * ```typescript
 * // codegen.ts
 * import type { CodegenConfig } from '@graphql-codegen/cli';
 * 
 * const config: CodegenConfig = {
 *   schema: 'schema.graphql',
 *   generates: {
 *     'generated/args-map.ts': {
 *       plugins: ['@atlassian-graphql-client/codegen-plugin-args-map']
 *     }
 *   }
 * };
 * ```
 */

import type { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { GraphQLSchema, isObjectType, GraphQLObjectType } from 'graphql';

export interface ArgsMapPluginConfig {
  /**
   * Import path for schema types
   * @default './schema-types.js'
   */
  schemaTypesImportPath?: string;
  
  /**
   * Name of the generated interface
   * @default 'ArgsTypeMap'
   */
  interfaceName?: string;
}

/**
 * Collects all Args type names from a GraphQL schema
 */
function collectArgsTypes(schema: GraphQLSchema): Set<string> {
  const argsTypes = new Set<string>();
  const visitedTypes = new Set<string>();

  function collectFromType(type: GraphQLObjectType, typeName: string) {
    // Prevent infinite recursion from circular references
    if (visitedTypes.has(typeName)) {
      return;
    }
    visitedTypes.add(typeName);

    const fields = type.getFields();

    for (const [fieldName, field] of Object.entries(fields)) {
      // Check if this field has arguments
      if (Object.keys(field.args).length > 0) {
        // Args type follows pattern: TypeName + fieldName + Args
        const argsTypeName = `${typeName}${fieldName}Args`;
        argsTypes.add(argsTypeName);
      }

      // Recursively check nested object types
      let currentType: any = field.type;
      
      // Unwrap GraphQL type wrappers (NonNull, List)
      while (currentType && 'ofType' in currentType) {
        currentType = currentType.ofType;
      }

      // If it's an object type, recursively collect its args
      if (currentType && 'name' in currentType) {
        const nestedType = schema.getType(currentType.name);
        if (nestedType && isObjectType(nestedType)) {
          collectFromType(nestedType, currentType.name);
        }
      }
    }
  }

  // Start from root types
  const queryType = schema.getQueryType();
  const mutationType = schema.getMutationType();
  const subscriptionType = schema.getSubscriptionType();

  if (queryType) collectFromType(queryType, 'Query');
  if (mutationType) collectFromType(mutationType, 'Mutation');
  if (subscriptionType) collectFromType(subscriptionType, 'Subscription');

  return argsTypes;
}

/**
 * GraphQL Codegen plugin function
 */
export const plugin: PluginFunction<ArgsMapPluginConfig> = (
  schema: GraphQLSchema,
  _documents: Types.DocumentFile[],
  config: ArgsMapPluginConfig = {}
): string => {
  const {
    schemaTypesImportPath = './schema-types.js',
    interfaceName = 'ArgsTypeMap'
  } = config;

  const argsTypes = collectArgsTypes(schema);
  const argsTypesArray = Array.from(argsTypes).sort();

  // Generate imports
  const imports = argsTypesArray.map(name => `  ${name}`).join(',\n');
  
  // Generate interface entries
  const mapEntries = argsTypesArray.map(name => `  '${name}': ${name};`).join('\n');

  return `/**
 * Auto-generated Args type map from GraphQL Codegen
 * Only includes Args types present in the schema for optimal tree-shaking
 * 
 * Generated: ${new Date().toISOString()}
 * Args types: ${argsTypesArray.length}
 */

import type {
${imports}
} from '${schemaTypesImportPath}';

/**
 * Maps Args type names to their types
 * Only includes types present in the schema for optimal tree-shaking
 */
export interface ${interfaceName} {
${mapEntries}
}
`;
};

// Default export for easier import
export default { plugin };

