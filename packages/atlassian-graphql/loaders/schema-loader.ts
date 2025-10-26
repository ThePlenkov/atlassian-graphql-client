import { loadSchema } from '@graphql-tools/load';
import { UrlLoader } from '@graphql-tools/url-loader';
import { wrapSchema, FilterRootFields, FilterObjectFields, PruneSchema } from '@graphql-tools/wrap';
import { type GraphQLSchema, type GraphQLObjectType, isObjectType } from 'graphql';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Custom schema loader that:
 * 1. Loads the real Atlassian GraphQL schema
 * 2. Reads sdk.config.ts
 * 3. Transforms the schema to only include operations from the config
 * 4. Returns the filtered schema
 */
export default async function schemaLoader(schemaPointer: string, options: any): Promise<GraphQLSchema> {
  console.log('Loading schema from:', schemaPointer);
  
  // Load the full schema
  const fullSchema = await loadSchema('https://api.atlassian.com/graphql', {
    loaders: [new UrlLoader()],
  });

  // Load the config
  const configPath = resolve(__dirname, '..', 'sdk.config.ts');
  const configModule = await import(configPath);
  const config = configModule.default;

  console.log('Loaded config, transforming schema...');

  // Build lookup maps for filtering
  const allowedModules = new Map<string, Set<string>>(); // operationType -> Set<moduleName>
  const moduleTypeToOperations = new Map<string, Set<string>>(); // moduleTypeName -> Set<operationName>

  // Process Query config
  if (config.Query) {
    const queryType = fullSchema.getType('Query') as GraphQLObjectType;
    if (queryType && isObjectType(queryType)) {
      const queryFields = queryType.getFields();
      const queryModules = new Set<string>();
      
      for (const [moduleName, operations] of Object.entries(config.Query)) {
        if (queryFields[moduleName]) {
          queryModules.add(moduleName);
          
          const moduleTypeName = queryFields[moduleName].type.toString().replace(/[!\[\]]/g, '');
          const operationNames = new Set(Object.keys(operations as Record<string, any>));
          moduleTypeToOperations.set(moduleTypeName, operationNames);
        }
      }
      
      allowedModules.set('Query', queryModules);
    }
  }

  // Process Mutation config
  if (config.Mutation) {
    const mutationType = fullSchema.getType('Mutation') as GraphQLObjectType;
    if (mutationType && isObjectType(mutationType)) {
      const mutationFields = mutationType.getFields();
      const mutationModules = new Set<string>();
      
      for (const [moduleName, operations] of Object.entries(config.Mutation)) {
        if (mutationFields[moduleName]) {
          mutationModules.add(moduleName);
          
          const moduleTypeName = mutationFields[moduleName].type.toString().replace(/[!\[\]]/g, '');
          const operationNames = new Set(Object.keys(operations as Record<string, any>));
          moduleTypeToOperations.set(moduleTypeName, operationNames);
        }
      }
      
      allowedModules.set('Mutation', mutationModules);
    }
  }

  // Apply transforms using @graphql-tools/wrap
  const filteredSchema = wrapSchema({
    schema: fullSchema,
    transforms: [
      // Filter root fields (Query.jira, Query.confluence, etc.)
      new FilterRootFields((operation, fieldName) => {
        const allowed = allowedModules.get(operation);
        return allowed ? allowed.has(fieldName) : false;
      }),
      
      // Filter fields within module types (JiraQuery.issue, etc.)
      new FilterObjectFields((typeName, fieldName) => {
        const allowedOperations = moduleTypeToOperations.get(typeName);
        // If not a module type, keep all fields
        if (!allowedOperations) return true;
        // If it's a module type, only keep configured operations
        return allowedOperations.has(fieldName);
      }),
      
      // Remove unused types
      new PruneSchema(),
    ],
  });

  console.log('Schema transformed successfully');
  return filteredSchema;
}

