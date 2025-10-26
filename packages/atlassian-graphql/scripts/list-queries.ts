/**
 * Lists all query fields from the root Query type
 * Shows the difference between module queries and direct operations
 * Run: npm run list:queries
 */

import { loadSchema } from '@graphql-tools/load';
import { UrlLoader } from '@graphql-tools/url-loader';
import { isObjectType } from 'graphql';

async function listQueries() {
  console.log('🔍 Loading schema from https://api.atlassian.com/graphql\n');
  
  const schema = await loadSchema('https://api.atlassian.com/graphql', {
    loaders: [new UrlLoader()],
  });

  const queryType = schema.getQueryType();
  
  if (!queryType) {
    console.error('❌ No Query type found');
    return;
  }

  const fields = queryType.getFields();
  
  console.log(`📊 Root Query has ${Object.keys(fields).length} total fields\n`);
  
  // Find only module queries (fields returning *Query types)
  const moduleQueries: Array<[string, any]> = [];
  
  for (const [fieldName, field] of Object.entries(fields)) {
    const fieldType = field.type.toString().replace(/[!\[\]]/g, '');
    const returnType = schema.getType(fieldType);
    
    // Only get module queries (returns *Query/*QueryApi type with sub-operations)
    const isModule = fieldType.endsWith('Query') || fieldType.endsWith('QueryApi');
    
    if (returnType && isObjectType(returnType) && isModule) {
      const operations = Object.keys(returnType.getFields());
      moduleQueries.push([fieldName, { type: fieldType, count: operations.length, field }]);
    }
  }
  
  console.log(`🏗️  MODULE QUERIES (${moduleQueries.length}):\n`);
  
  for (const [name, info] of moduleQueries) {
    console.log(`  ✓ ${name.padEnd(25)} → ${info.type.padEnd(30)} (${info.count} operations)`);
  }
  
  console.log(`\n📊 Total: ${moduleQueries.length} modules with ${moduleQueries.reduce((sum, [, info]) => sum + info.count, 0)} operations\n`);
}

listQueries().catch(console.error);

