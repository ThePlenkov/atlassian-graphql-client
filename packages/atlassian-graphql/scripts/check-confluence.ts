/**
 * Check if confluence exists in the schema
 * Run: npm run check:confluence
 */

import { loadSchema } from '@graphql-tools/load';
import { UrlLoader } from '@graphql-tools/url-loader';
import { isObjectType } from 'graphql';

async function checkConfluence() {
  console.log('🔍 Loading schema...\n');
  
  const schema = await loadSchema('https://api.atlassian.com/graphql', {
    loaders: [new UrlLoader()],
  });

  const queryType = schema.getQueryType();
  if (!queryType) {
    console.log('❌ No Query type');
    return;
  }

  const fields = queryType.getFields();
  
  // Look for confluence
  const confluence = fields['confluence'];
  
  if (confluence) {
    console.log('✅ Found "confluence" field on Query\n');
    console.log(`Field name: confluence`);
    console.log(`Return type: ${confluence.type.toString()}`);
    console.log(`Type (clean): ${confluence.type.toString().replace(/[!\[\]]/g, '')}`);
    
    const fieldType = confluence.type.toString().replace(/[!\[\]]/g, '');
    const returnType = schema.getType(fieldType);
    
    if (returnType && isObjectType(returnType)) {
      const subFields = Object.keys(returnType.getFields());
      console.log(`Sub-fields: ${subFields.length}`);
      console.log(`First 10 operations: ${subFields.slice(0, 10).join(', ')}`);
      
      console.log(`\nType name ends with:`);
      console.log(`  - *Query? ${fieldType.endsWith('Query')}`);
      console.log(`  - *Mutation? ${fieldType.endsWith('Mutation')}`);
    }
    
    console.log(`\nDescription: ${confluence.description || '(none)'}`);
    console.log(`Arguments: ${confluence.args.length}`);
    if (confluence.args.length > 0) {
      console.log(`  Args: ${confluence.args.map(a => `${a.name}: ${a.type}`).join(', ')}`);
    }
  } else {
    console.log('❌ No "confluence" field found on Query\n');
    
    // Search for anything with confluence in the name
    const confluenceFields = Object.keys(fields).filter(f => 
      f.toLowerCase().includes('confluence')
    );
    
    if (confluenceFields.length > 0) {
      console.log(`Found ${confluenceFields.length} fields with "confluence" in name:`);
      for (const name of confluenceFields) {
        const field = fields[name];
        const type = field.type.toString().replace(/[!\[\]]/g, '');
        console.log(`  - ${name}: ${type}`);
      }
    } else {
      console.log('No fields with "confluence" in name found at all');
    }
  }
  
  console.log();
}

checkConfluence().catch(console.error);

