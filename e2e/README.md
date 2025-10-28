# E2E Tests

End-to-end tests that verify the full stack: authentication, query building, GraphQL execution, and result parsing.

**🎉 Uses Node.js 24+ native TypeScript support - no build step required!**

## Prerequisites

Before running e2e tests, you need:

1. **Authentication**: Login with your Atlassian credentials
   ```bash
   jira auth login
   ```

2. **Configuration**: Ensure `~/.atlassian-tools/config.json` has:
   - `baseUrl` - Your Atlassian instance URL (e.g., `https://your-company.atlassian.net`)
   - `cloudId` - Automatically fetched during login
   - `auth.type` - Either `"token"` or `"oauth"`

## Running Tests

Run individual test:
```bash
node --test e2e/jira-search-my-issues.test.ts
```

Run all e2e tests:
```bash
npm test
# or
npm run test:e2e
```

## Test Structure

Each test demonstrates:
- ✅ Query builder usage
- ✅ Field selection (including nested objects)
- ✅ Variable handling
- ✅ Error handling
- ✅ Result validation

## Available Tests

### `jira-search-my-issues.test.ts`
Searches for Jira issues assigned to the current user.

**What it tests:**
- JQL query execution
- Pagination (top 10 results)
- Nested field selection (status, priority, assignee, project)
- Connection pattern (edges/nodes)

**Expected output:**
```
✅ Success! Found 42 issues assigned to you

📋 Showing top 10 issues:

1. PROJ-123: Implement new feature
   Status: In Progress
   Priority: High
   ...
```

## Writing New Tests

1. Create a new file: `e2e/[feature].test.ts`
2. Use the test template:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import { GraphQLClient } from 'graphql-request';
import { createQueryBuilder, $$ } from '@atlassian-tools/gql';
import { loadConfig, getValidToken } from '@atlassian-tools/cli/auth/config';

test('Test description', async () => {
  // Setup
  const config = await loadConfig();
  const token = await getValidToken();
  
  assert.ok(token, 'Not authenticated');
  assert.ok(config.cloudId, 'Cloud ID not configured');
  
  // Build query
  const builder = createQueryBuilder();
  const query = builder.query('TestQuery', q => [
    // ... your query
  ]);
  
  // Execute
  const client = new GraphQLClient(apiUrl, { /* ... */ });
  const result = await client.request(query, variables);
  
  // Assertions
  assert.ok(result.jira, 'jira field should exist');
  assert.strictEqual(result.jira.someField, expectedValue);
});
```

3. Run it:
   ```bash
   node --test e2e/your-test.test.ts
   ```

## CI/CD Integration

These tests can run in CI if you provide:
- `ATLASSIAN_TOKEN` - API token or OAuth token
- `ATLASSIAN_BASE_URL` - Your Atlassian instance URL
- `ATLASSIAN_CLOUD_ID` - Your cloud ID

Example GitHub Actions:
```yaml
- name: Run E2E Tests
  env:
    ATLASSIAN_TOKEN: ${{ secrets.ATLASSIAN_TOKEN }}
    ATLASSIAN_BASE_URL: ${{ secrets.ATLASSIAN_BASE_URL }}
    ATLASSIAN_CLOUD_ID: ${{ secrets.ATLASSIAN_CLOUD_ID }}
  run: npm run test:e2e
```

