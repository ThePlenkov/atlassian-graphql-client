#!/usr/bin/env node
/**
 * Simple Jira CLI using gqlb
 * 
 * Usage:
 *   jira get issue FSINN-123 --fields id,key,webUrl
 *   jira get issue FSINN-123 --fields id,key,summaryField.text
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { buildSchema } from 'graphql';
import { createQueryBuilder, $$ } from '../../gqlb/src/index';
import { GraphQLClient } from 'graphql-request';
import { print } from 'graphql';

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 3 || args[0] !== 'get' || args[1] !== 'issue') {
  console.error('Usage: jira get issue <issue-key> [--fields <field1,field2,...>]');
  console.error('');
  console.error('Examples:');
  console.error('  jira get issue FSINN-123 --fields id,key,webUrl');
  console.error('  jira get issue FSINN-123 --fields id,key,summaryField.text');
  process.exit(1);
}

const issueKey = args[2];
const fieldsIndex = args.indexOf('--fields');
const fields = fieldsIndex >= 0 && args[fieldsIndex + 1] 
  ? args[fieldsIndex + 1].split(',').map(f => f.trim())
  : ['id', 'key', 'webUrl']; // default fields

console.log(`\n🔍 Fetching issue: ${issueKey}`);
console.log(`📋 Fields: ${fields.join(', ')}\n`);

// Load schema
const schemaPath = join(__dirname, '../src/generated/schema.graphql');
const schemaSDL = readFileSync(schemaPath, 'utf-8');
const schema = buildSchema(schemaSDL);

// Create query builder
const builder = createQueryBuilder(schema);

/**
 * Recursively build field selection based on dot notation
 * Example: "summaryField.text" becomes summaryField(s => [s.text()])
 */
function buildFieldSelection(fieldPath: string, proxy: any): any {
  const parts = fieldPath.split('.');
  const fieldName = parts[0];
  
  if (parts.length === 1) {
    // Simple scalar field
    return proxy[fieldName]();
  } else {
    // Nested field with dot notation
    return proxy[fieldName]((nested: any) => [
      buildFieldSelection(parts.slice(1).join('.'), nested)
    ]);
  }
}

// Build the query dynamically based on requested fields
const issueIdVar = $$<string>('issueId');

async function main() {
try {
  const query = builder.query(q => [
    q.jira(jira => [
      jira.issue({ id: issueIdVar }, issue => 
        fields.map(field => buildFieldSelection(field, issue))
      )
    ])
  ]);

  console.log('📝 Generated GraphQL Query:');
  console.log('─'.repeat(60));
  console.log(print(query));
  console.log('─'.repeat(60));
  console.log('');

  // Check for environment variables
  const apiUrl = process.env.ATLASSIAN_API_URL || 'https://api.atlassian.com/graphql';
  const token = process.env.ATLASSIAN_TOKEN;

  if (!token) {
    console.log('⚠️  No ATLASSIAN_TOKEN environment variable set.');
    console.log('');
    console.log('To execute the query, set:');
    console.log('  export ATLASSIAN_TOKEN="your-token-here"');
    console.log('');
    console.log('✅ Query built successfully! (dry-run mode)');
    process.exit(0);
  }

  // Execute the query
  console.log('🚀 Executing query...\n');
  
  const client = new GraphQLClient(apiUrl, {
    headers: {
      authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const result = await client.request(query, { issueId: issueKey });

  console.log('✅ Result:');
  console.log(JSON.stringify(result, null, 2));

} catch (error: any) {
  if (error.message && error.message.includes('does not exist')) {
    console.error(`\n❌ Error: ${error.message}`);
    console.error('\n💡 Tip: Check available fields in the schema or use simpler fields like:');
    console.error('   id, key, issueId, webUrl');
  } else {
    console.error('\n❌ Error:', error.message || error);
  }
  process.exit(1);
}
}

// Run the CLI
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

