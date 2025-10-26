import { loadSchema } from '@graphql-tools/load';
import { UrlLoader } from '@graphql-tools/url-loader';
import { wrapSchema, FilterRootFields, FilterObjectFields, FilterTypes, PruneSchema } from '@graphql-tools/wrap';
import { printSchema } from 'graphql';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { isObjectType, type GraphQLObjectType } from 'graphql';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

async function filterSchema() {
  console.log('🔄 Filtering Atlassian GraphQL schema based on sdk.config.ts...\n');
  
  // Load the full schema
  const fullSchema = await loadSchema('https://api.atlassian.com/graphql', {
    loaders: [new UrlLoader()],
  });

  // Load the config
  const configPath = join(projectRoot, 'sdk.config.ts');
  const configModule = await import(configPath);
  const config = configModule.default;

  // Build lookup maps for filtering
  const allowedModules = new Map<string, Set<string>>();
  const moduleTypeToOperations = new Map<string, Set<string>>();

  // Process Query config
  if (config.Query) {
    const queryType = fullSchema.getType('Query') as GraphQLObjectType;
    if (queryType && isObjectType(queryType)) {
      const queryFields = queryType.getFields();
      const queryModules = new Set<string>();
      
      for (const [moduleName, operations] of Object.entries(config.Query)) {
        if (queryFields[moduleName]) {
          queryModules.add(moduleName);
          console.log(`  ✓ Query.${moduleName} (${Object.keys(operations as Record<string, any>).length} operations)`);
          
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
          console.log(`  ✓ Mutation.${moduleName} (${Object.keys(operations as Record<string, any>).length} operations)`);
          
          const moduleTypeName = mutationFields[moduleName].type.toString().replace(/[!\[\]]/g, '');
          const operationNames = new Set(Object.keys(operations as Record<string, any>));
          moduleTypeToOperations.set(moduleTypeName, operationNames);
        }
      }
      
      allowedModules.set('Mutation', mutationModules);
    }
  }

  // Collect all allowed type names
  const allowedTypeNames = new Set<string>(['Query', 'Mutation']);
  for (const typeSet of moduleTypeToOperations.keys()) {
    allowedTypeNames.add(typeSet);
  }

  // Apply transforms with aggressive pruning
  const filteredSchema = wrapSchema({
    schema: fullSchema,
    transforms: [
      // Filter root fields (Query.jira, Mutation.jira, etc.)
      new FilterRootFields((operation, fieldName) => {
        const allowed = allowedModules.get(operation);
        return allowed ? allowed.has(fieldName) : false;
      }),
      
      // Filter object fields (JiraQuery.issue, etc.)
      new FilterObjectFields((typeName, fieldName) => {
        const allowedOperations = moduleTypeToOperations.get(typeName);
        if (!allowedOperations) return true;
        return allowedOperations.has(fieldName);
      }),
      
      // Remove unused types more aggressively
      new PruneSchema({
        skipEmptyCompositeTypePruning: false,
        skipUnimplementedInterfacesPruning: false,
        skipEmptyUnionPruning: false,
        skipUnusedTypesPruning: false,
      }),
    ],
  });

  // Verify pruning is complete by applying PruneSchema again
  console.log('\n🔍 Verifying pruning is complete...');
  const doublePrunedSchema = wrapSchema({
    schema: filteredSchema,
    transforms: [
      new PruneSchema({
        skipEmptyCompositeTypePruning: false,
        skipUnimplementedInterfacesPruning: false,
        skipEmptyUnionPruning: false,
        skipUnusedTypesPruning: false,
      }),
    ],
  });

  const filteredSchemaSDL = printSchema(filteredSchema);
  const doublePrunedSchemaSDL = printSchema(doublePrunedSchema);
  
  if (filteredSchemaSDL === doublePrunedSchemaSDL) {
    console.log('   ✅ Schema is fully pruned (no changes after second pruning)');
  } else {
    console.log('   ⚠️  Second pruning removed additional content!');
    console.log(`   First prune: ${filteredSchemaSDL.length.toLocaleString()} chars`);
    console.log(`   Second prune: ${doublePrunedSchemaSDL.length.toLocaleString()} chars`);
    console.log(`   Additional reduction: ${((1 - doublePrunedSchemaSDL.length / filteredSchemaSDL.length) * 100).toFixed(2)}%`);
  }

  // Write both schemas to files
  const outputDir = join(projectRoot, 'src', 'generated');
  mkdirSync(outputDir, { recursive: true });

  // Save original full schema
  const fullSchemaSDL = printSchema(fullSchema);
  const fullSchemaPath = join(outputDir, 'schema.full.graphql');
  writeFileSync(fullSchemaPath, fullSchemaSDL);

  // Save filtered schema (use double-pruned if different)
  const finalSchemaSDL = filteredSchemaSDL === doublePrunedSchemaSDL ? filteredSchemaSDL : doublePrunedSchemaSDL;
  const filteredSchemaPath = join(outputDir, 'schema.graphql');
  writeFileSync(filteredSchemaPath, finalSchemaSDL);

  console.log(`\n✅ Full schema saved to src/generated/schema.full.graphql`);
  console.log(`   📊 Size: ${fullSchemaSDL.length.toLocaleString()} characters`);
  console.log(`\n✅ Filtered schema saved to src/generated/schema.graphql`);
  console.log(`   📊 Size: ${finalSchemaSDL.length.toLocaleString()} characters`);
  console.log(`   📉 Reduction: ${((1 - finalSchemaSDL.length / fullSchemaSDL.length) * 100).toFixed(1)}%`);
}

filterSchema().catch(console.error);

