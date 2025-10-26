import { jira } from '../src';
import type { JiraIssue } from '../src';

// Create Jira SDK
const sdk = jira({ 
  token: process.env.ATLASSIAN_TOKEN || 'your-token' 
});

// Example 1: Query - operation name is type-checked!
async function getRankField() {
  const result = await sdk.query(
    'rankField',  // ← Autocomplete shows all 217+ JiraQuery operations
    'fieldId fieldName',
    { cloudId: 'your-cloud-id' }
  );
  
  console.log(result);
}

// Example 2: Query with complex fields
async function searchIssues() {
  const result = await sdk.query(
    'issueSearch',
    `
      edges {
        node {
          id
          key
          summary
        }
      }
      pageInfo {
        hasNextPage
      }
    `,
    {
      cloudId: 'your-cloud-id',
      issueSearchInput: {
        jql: 'project = DEMO',
        first: 10,
      },
    }
  );
  
  console.log(result);
}

// Example 3: Mutation - operation name is type-checked!
async function createIssue() {
  const result = await sdk.mutation(
    'issueCreate',  // ← Autocomplete shows all 231+ JiraMutation operations
    `
      issue {
        id
        key
      }
      errors {
        message
      }
    `,
    {
      cloudId: 'your-cloud-id',
      input: {
        // Input types available from imports
      },
    }
  );
  
  console.log(result);
}

// All types available for import:
// - JiraQuery (217+ operations)
// - JiraMutation (231+ operations)  
// - JiraIssue, JiraProject, etc. (all schema types)

