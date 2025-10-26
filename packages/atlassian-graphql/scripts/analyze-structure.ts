/**
 * Analyzes Query structure to find operation namespaces vs properties
 * Run: npm run analyze
 */

import { loadSchema } from '@graphql-tools/load';
import { UrlLoader } from '@graphql-tools/url-loader';
import { isObjectType, isScalarType, isEnumType, isListType, isInterfaceType, isUnionType } from 'graphql';

async function analyzeStructure() {
  console.log('🔍 Loading schema...\n');
  
  const schema = await loadSchema('https://api.atlassian.com/graphql', {
    loaders: [new UrlLoader()],
  });

  const queryType = schema.getQueryType();
  if (!queryType) return;

  const fields = queryType.getFields();
  
  const operationNamespaces: any[] = [];  // Fields that group operations
  const dataProperties: any[] = [];       // Fields that return data directly
  
  for (const [fieldName, field] of Object.entries(fields)) {
    const fieldType = field.type.toString().replace(/[!\[\]]/g, '');
    const returnType = schema.getType(fieldType);
    
    if (!returnType) continue;
    
    // Check if it's a scalar/enum (definitely a property)
    if (isScalarType(returnType) || isEnumType(returnType)) {
      dataProperties.push({ name: fieldName, type: fieldType, category: 'scalar/enum' });
      continue;
    }
    
    // Check if it's an object type
    if (isObjectType(returnType)) {
      const subFields = returnType.getFields();
      const subFieldCount = Object.keys(subFields).length;
      
      const hasArgs = field.args.length > 0;
      
      // Check if it's an operation namespace by type name pattern
      const isNamespace = fieldType.endsWith('Query') || 
                         fieldType.endsWith('Mutation') ||
                         fieldType.endsWith('QueryApi') ||
                         fieldType.endsWith('MutationApi');
      
      if (isNamespace) {
        operationNamespaces.push({ 
          name: fieldName, 
          type: fieldType, 
          operations: subFieldCount,
          hasArgs 
        });
      } else {
        dataProperties.push({ 
          name: fieldName, 
          type: fieldType, 
          fields: subFieldCount,
          hasArgs 
        });
      }
    } else {
      // Interface, Union, List, etc.
      dataProperties.push({ name: fieldName, type: fieldType, category: 'complex' });
    }
  }
  
  console.log(`🏗️  OPERATION NAMESPACES (${operationNamespaces.length}) - Group operations:\n`);
  for (const item of operationNamespaces) {
    console.log(`  ✓ ${item.name.padEnd(25)} → ${item.type.padEnd(35)} (${item.operations} ops)`);
  }
  
  console.log(`\n📦 DATA PROPERTIES (${dataProperties.length}) - Return data directly:\n`);
  for (const item of dataProperties.slice(0, 20)) {
    const info = item.operations ? `${item.operations} ops` : 
                 item.fields ? `${item.fields} fields` :
                 item.category;
    console.log(`  · ${item.name.padEnd(25)} → ${item.type.padEnd(35)} ${info ? `(${info})` : ''}`);
  }
  
  if (dataProperties.length > 20) {
    console.log(`  ... and ${dataProperties.length - 20} more\n`);
  }
  
  console.log(`\n💡 Summary:`);
  console.log(`   - ${operationNamespaces.length} operation namespaces (modules)`);
  console.log(`   - ${dataProperties.length} data properties`);
  console.log(`   - Total: ${Object.keys(fields).length} fields on Query\n`);
  
  console.log(`📋 Selector criteria for namespaces:`);
  console.log(`   - Type name ends with: *Query, *QueryApi, *Mutation, or *MutationApi`);
  console.log(`   - These are the "modules" we should support in SDK\n`);
}

analyzeStructure().catch(console.error);

