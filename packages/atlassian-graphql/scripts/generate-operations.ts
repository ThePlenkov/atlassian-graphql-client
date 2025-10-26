import { loadSchema } from '@graphql-tools/load';
import { UrlLoader } from '@graphql-tools/url-loader';
import { type GraphQLObjectType, isObjectType } from 'graphql';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const operationsDir = join(projectRoot, 'src', 'operations');

function buildOperationArgs(moduleField: any, field: any) {
  // Check if module requires cloudId
  const needsCloudId = moduleField.args.some((arg: any) => arg.name === 'cloudId');
  
  // Build args, deduplicating cloudId if it appears in both module and field
  const allArgsMap = new Map<string, string>();
  
  if (needsCloudId) {
    allArgsMap.set('cloudId', '$cloudId: ID!');
  }
  
  // Add field args, skipping cloudId if already added
  for (const arg of field.args) {
    if (arg.name === 'cloudId' && needsCloudId) {
      // Skip - already added from module
      continue;
    }
    allArgsMap.set(arg.name, `$${arg.name}: ${arg.type}`);
  }
  
  return {
    allArgs: Array.from(allArgsMap.values()),
    fieldArgsList: field.args.map((arg: any) => `${arg.name}: $${arg.name}`).join(', '),
    needsCloudId
  };
}

async function generateOperations() {
  console.log('🔄 Generating GraphQL operations from sdk.config.ts...\n');
  
  // Load the full schema
  const schema = await loadSchema('https://api.atlassian.com/graphql', {
    loaders: [new UrlLoader()],
  });

  // Load the config
  const configPath = join(projectRoot, 'sdk.config.ts');
  const configModule = await import(configPath);
  const config = configModule.default;

  // Clean and recreate operations directory
  try {
    rmSync(operationsDir, { recursive: true, force: true });
  } catch (e) {}
  mkdirSync(operationsDir, { recursive: true });

  let generatedCount = 0;

  // Process Query operations
  if (config.Query) {
    const queryType = schema.getType('Query') as GraphQLObjectType;
    if (queryType && isObjectType(queryType)) {
      const queryFields = queryType.getFields();
      
      for (const [moduleName, operations] of Object.entries(config.Query)) {
        const moduleField = queryFields[moduleName];
        if (!moduleField) continue;

        const moduleType = schema.getType(moduleField.type.toString().replace(/[!\[\]]/g, ''));
        if (!moduleType || !isObjectType(moduleType)) continue;

        const moduleFields = moduleType.getFields();
        const moduleDir = join(operationsDir, moduleName);
        mkdirSync(moduleDir, { recursive: true });

        for (const [operationName, operationConfig] of Object.entries(operations as Record<string, any>)) {
          const field = moduleFields[operationName];
          if (!field) {
            console.log(`  ⚠️  Operation ${moduleName}.${operationName} not found in schema`);
            continue;
          }

          // Build operation name
          const capitalizedOp = operationName.charAt(0).toUpperCase() + operationName.slice(1);
          
          // Build args (deduplicated)
          const { allArgs, fieldArgsList, needsCloudId } = buildOperationArgs(moduleField, field);
          
          // Build the operation document
          const operationDocument = `query ${capitalizedOp}${allArgs.length > 0 ? `(${allArgs.join(', ')})` : ''} {
  ${moduleName}${needsCloudId ? '(cloudId: $cloudId)' : ''} {
    ${operationName}${fieldArgsList ? `(${fieldArgsList})` : ''} {
      __typename
    }
  }
}
`;

          const filePath = join(moduleDir, `${operationName}.graphql`);
          writeFileSync(filePath, operationDocument);
          console.log(`  ✓ ${moduleName}/${operationName}.graphql`);
          generatedCount++;
        }
      }
    }
  }

  // Process Mutation operations
  if (config.Mutation) {
    const mutationType = schema.getType('Mutation') as GraphQLObjectType;
    if (mutationType && isObjectType(mutationType)) {
      const mutationFields = mutationType.getFields();
      
      for (const [moduleName, operations] of Object.entries(config.Mutation)) {
        const moduleField = mutationFields[moduleName];
        if (!moduleField) continue;

        const moduleType = schema.getType(moduleField.type.toString().replace(/[!\[\]]/g, ''));
        if (!moduleType || !isObjectType(moduleType)) continue;

        const moduleFields = moduleType.getFields();
        const moduleDir = join(operationsDir, moduleName);
        mkdirSync(moduleDir, { recursive: true });

        for (const [operationName, operationConfig] of Object.entries(operations as Record<string, any>)) {
          const field = moduleFields[operationName];
          if (!field) {
            console.log(`  ⚠️  Operation ${moduleName}.${operationName} not found in schema`);
            continue;
          }

          // Build operation name
          const capitalizedOp = operationName.charAt(0).toUpperCase() + operationName.slice(1);
          
          // Build args (deduplicated)
          const { allArgs, fieldArgsList, needsCloudId } = buildOperationArgs(moduleField, field);
          
          // Build the operation document
          const operationDocument = `mutation ${capitalizedOp}${allArgs.length > 0 ? `(${allArgs.join(', ')})` : ''} {
  ${moduleName}${needsCloudId ? '(cloudId: $cloudId)' : ''} {
    ${operationName}${fieldArgsList ? `(${fieldArgsList})` : ''} {
      __typename
    }
  }
}
`;

          const filePath = join(moduleDir, `${operationName}.graphql`);
          writeFileSync(filePath, operationDocument);
          console.log(`  ✓ ${moduleName}/${operationName}.graphql`);
          generatedCount++;
        }
      }
    }
  }

  console.log(`\n✅ Generated ${generatedCount} operation files`);
}

generateOperations().catch(console.error);

