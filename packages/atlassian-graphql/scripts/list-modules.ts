/**
 * Lists all module patterns in Query and Mutation
 * Run: npm run list:modules
 */

import { loadSchema } from '@graphql-tools/load';
import { UrlLoader } from '@graphql-tools/url-loader';
import { isObjectType } from 'graphql';

async function listModules() {
  console.log('🔍 Loading schema from https://api.atlassian.com/graphql\n');
  
  const schema = await loadSchema('https://api.atlassian.com/graphql', {
    loaders: [new UrlLoader()],
  });

  const queryType = schema.getQueryType();
  const mutationType = schema.getMutationType();
  
  // Check Query modules
  if (queryType) {
    console.log('📥 QUERY TYPE MODULES:\n');
    
    const fields = queryType.getFields();
    const patterns = new Map<string, number>();
    
    for (const [fieldName, field] of Object.entries(fields)) {
      const fieldType = field.type.toString().replace(/[!\[\]]/g, '');
      const returnType = schema.getType(fieldType);
      
      if (returnType && isObjectType(returnType)) {
        // Extract pattern (suffix after last capital letter before end)
        const match = fieldType.match(/([A-Z][a-z]+)$/);
        const pattern = match ? match[1] : 'Other';
        patterns.set(pattern, (patterns.get(pattern) || 0) + 1);
        
        if (fieldType.endsWith('Query')) {
          const operations = Object.keys(returnType.getFields());
          console.log(`  ✓ ${fieldName.padEnd(25)} → ${fieldType.padEnd(35)} (${operations.length} ops)`);
        }
      }
    }
    
    console.log('\n  Pattern distribution:');
    for (const [pattern, count] of Array.from(patterns.entries()).sort((a, b) => b[1] - a[1])) {
      console.log(`    - *${pattern}: ${count} fields`);
    }
  }
  
  // Check Mutation modules
  if (mutationType) {
    console.log('\n📤 MUTATION TYPE MODULES:\n');
    
    const fields = mutationType.getFields();
    const patterns = new Map<string, number>();
    
    for (const [fieldName, field] of Object.entries(fields)) {
      const fieldType = field.type.toString().replace(/[!\[\]]/g, '');
      const returnType = schema.getType(fieldType);
      
      if (returnType && isObjectType(returnType)) {
        // Extract pattern
        const match = fieldType.match(/([A-Z][a-z]+)$/);
        const pattern = match ? match[1] : 'Other';
        patterns.set(pattern, (patterns.get(pattern) || 0) + 1);
        
        if (fieldType.endsWith('Mutation')) {
          const operations = Object.keys(returnType.getFields());
          console.log(`  ✓ ${fieldName.padEnd(25)} → ${fieldType.padEnd(35)} (${operations.length} ops)`);
        }
      }
    }
    
    console.log('\n  Pattern distribution:');
    for (const [pattern, count] of Array.from(patterns.entries()).sort((a, b) => b[1] - a[1])) {
      console.log(`    - *${pattern}: ${count} fields`);
    }
  }
  
  console.log('\n✅ Selector patterns found: *Query and *Mutation\n');
}

listModules().catch(console.error);

