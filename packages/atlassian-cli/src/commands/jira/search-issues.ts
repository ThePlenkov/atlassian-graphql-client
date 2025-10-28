import { GraphQLClient } from 'graphql-request';
import { createQueryBuilder, $$, $ } from '@atlassian-tools/gql';
import { print } from 'graphql';
import { getValidToken, loadConfig } from '../../auth/config.js';
import { ATLASSIAN_DEFAULTS } from '../../constants.js';

interface SearchIssuesOptions {
  fields: string;
  limit: string;
  cloudId?: string;
  token?: string;
  url?: string;
}

/**
 * Recursively build field selection based on dot notation
 */
function buildFieldSelection(fieldPath: string, proxy: any): any {
  const parts = fieldPath.split('.');
  const fieldName = parts[0];
  
  if (parts.length === 1) {
    return proxy[fieldName]();
  } else {
    return proxy[fieldName]((nested: any) => [
      buildFieldSelection(parts.slice(1).join('.'), nested)
    ]);
  }
}

export async function searchIssues(jql: string, options: SearchIssuesOptions) {
  console.log(`\n🔍 Searching issues with JQL: ${jql}`);
  
  const fields = options.fields.split(',').map(f => f.trim());
  const limit = parseInt(options.limit, 10);
  
  console.log(`📋 Fields: ${fields.join(', ')}`);
  console.log(`🔢 Limit: ${limit}\n`);

  // Create query builder
  const builder = createQueryBuilder();
  const cloudIdVar = $$<string>('cloudId');
  const jqlVar = $$<string>('jql');
  const limitVar = $<number>('limit');

  try {
    // Build the query dynamically
    const query = builder.query((q: any) => [
      q.jira((jira: any) => [
        jira.issueSearch({
          cloudId: cloudIdVar,
          issueSearchInput: { jql: jqlVar },
          first: limitVar
        }, (search: any) => [
          search.edges((edge: any) => [
            edge.node((node: any) =>
              fields.map(field => buildFieldSelection(field, node))
            )
          ]),
          search.pageInfo((pageInfo: any) => [
            pageInfo.hasNextPage(),
            pageInfo.endCursor()
          ])
        ])
      ])
    ]);

    console.log('📝 Generated GraphQL Query:');
    console.log('─'.repeat(60));
    console.log(print(query));
    console.log('─'.repeat(60));
    console.log('');

    // Get token from options, env var, or stored config
    let token = options.token || process.env.ATLASSIAN_TOKEN;
    
    if (!token) {
      token = await getValidToken() || undefined;
    }

    if (!token) {
      console.error('❌ Error: Not authenticated');
      console.error('\nPlease login first:');
      console.error('  atlassian login --client-id YOUR_ID --client-secret YOUR_SECRET');
      process.exit(1);
    }

    // Get config for defaults
    const config = await loadConfig();
    const cloudId = options.cloudId || config.cloudId || process.env.ATLASSIAN_CLOUD_ID;
    
    if (!cloudId) {
      console.error('❌ Error: Missing cloud ID');
      console.error('\nSet it during login or provide:');
      console.error('  --cloud-id YOUR_CLOUD_ID');
      console.error('  or set ATLASSIAN_CLOUD_ID environment variable');
      process.exit(1);
    }

    const apiUrl = options.url || config.apiUrl || process.env.ATLASSIAN_API_URL || ATLASSIAN_DEFAULTS.GRAPHQL_URL;

    // Execute the query
    console.log('🚀 Executing query...\n');
    
    const client = new GraphQLClient(apiUrl, {
      headers: {
        authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await client.request(query, { 
      cloudId,
      jql,
      limit
    });

    console.log('✅ Result:');
    console.log(JSON.stringify(result, null, 2));
    console.log('');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message || error);
    if (error.response?.errors) {
      console.error('\nGraphQL Errors:');
      error.response.errors.forEach((err: any) => {
        console.error(`  - ${err.message}`);
      });
    }
    process.exit(1);
  }
}

