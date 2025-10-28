# @atlassian-tools/cli

A command-line interface for Atlassian APIs (Jira, Confluence) using GraphQL with dynamic field selection and OAuth authentication.

## Architecture

```
@atlassian-tools/cli    (CLI commands & OAuth auth)
    ↓
@atlassian-tools/gql    (GraphQL client + Atlassian schema)
    ↓
gqlb                    (Runtime proxy-based query builder)
```

## Installation

```bash
npm install -g @atlassian-tools/cli
```

Or use directly from the workspace:

```bash
cd packages/atlassian-cli
npm install
npx nx build atlassian-cli
```

## Authentication

The CLI stores configuration in `~/.atlassian-tools/`:
- `config.json` - OAuth client credentials and cloud ID
- `token.json` - Access and refresh tokens

### Option 1: OAuth Flow (Recommended)

1. **Create an OAuth 2.0 App** at [Atlassian Developer Console](https://developer.atlassian.com/console/myapps/)
   - Click "Create" → "OAuth 2.0 integration"
   - Name your app (e.g., "My Atlassian CLI")
   - Add redirect URI: `http://localhost:3000/callback`
   - Set permissions:
     - Jira API: `read:jira-work`, `write:jira-work`, `read:jira-user`
     - Confluence API: `read:confluence-content.all`
     - Offline access: `offline_access` (for token refresh)
   - Copy your Client ID and Client Secret

2. **Login via OAuth**:
```bash
atlassian login --client-id YOUR_CLIENT_ID --client-secret YOUR_CLIENT_SECRET
```

This will:
- Open your browser for authorization
- Exchange the code for an access token
- Fetch and save your Cloud IDs
- Store credentials in `~/.atlassian-tools/`

### Option 2: API Token (Quick Start)

Generate an API token at [https://id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens)

```bash
atlassian login --token YOUR_API_TOKEN
```

### Check Authentication Status

```bash
atlassian whoami
```

Shows:
- Config file locations
- Token status and expiration
- Cloud IDs
- User info (if valid)

### Logout

```bash
atlassian logout
```

## Usage

Once logged in, you don't need to specify `--token` or `--cloud-id` anymore!

### Jira Commands

#### Get Issue

```bash
# After login, just use:
atlassian jira get FSINN-123

# Get specific fields
atlassian jira get FSINN-123 --fields id,key,issueId,webUrl

# Get nested fields (dot notation)
atlassian jira get FSINN-123 --fields id,key,summaryField.text

# Override stored credentials (optional)
atlassian jira get FSINN-123 --token "other-token"
```

#### Search Issues

```bash
# After login (cloud-id is stored):
atlassian jira search "project = DEMO"

# Search with specific fields
atlassian jira search "project = DEMO" --fields id,key,webUrl --limit 20

# Search with nested fields
atlassian jira search "assignee = currentUser()" --fields id,key,summaryField.text

# Override cloud ID (optional)
atlassian jira search "project = DEMO" --cloud-id "other-cloud-id"
```

### Development

Run directly without building:

```bash
# From packages/atlassian-cli
npx tsx src/cli.ts login --token YOUR_TOKEN
npx tsx src/cli.ts whoami
npx tsx src/cli.ts jira get FSINN-123 --fields id,key,webUrl
```

### Environment Variables (Optional)

You can still use environment variables to override stored config:

```bash
export ATLASSIAN_TOKEN="your-api-token"
export ATLASSIAN_CLOUD_ID="your-cloud-id"
export ATLASSIAN_API_URL="https://api.atlassian.com/graphql"

atlassian jira get FSINN-123
```

## Examples

### Basic Issue Fetch

```bash
$ atlassian jira get FSINN-123 --fields id,key,webUrl

🔍 Fetching issue: FSINN-123
📋 Fields: id, key, webUrl

📝 Generated GraphQL Query:
────────────────────────────────────────────────────────────
query ($issueId: ID!) {
  jira {
    issue(id: $issueId) {
      id
      key
      webUrl
    }
  }
}
────────────────────────────────────────────────────────────

🚀 Executing query...

✅ Result:
{
  "jira": {
    "issue": {
      "id": "...",
      "key": "FSINN-123",
      "webUrl": "https://..."
    }
  }
}
```

### Search Issues

```bash
$ atlassian jira search "project = DEMO AND status = Open" --limit 5

🔍 Searching issues with JQL: project = DEMO AND status = Open
📋 Fields: id, key, webUrl
🔢 Limit: 5

📝 Generated GraphQL Query:
────────────────────────────────────────────────────────────
query ($cloudId: ID!, $jql: String!, $limit: Int) {
  jira {
    issueSearch(
      cloudId: $cloudId
      issueSearchInput: {jql: $jql}
      first: $limit
    ) {
      edges {
        node {
          id
          key
          webUrl
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
}
────────────────────────────────────────────────────────────

🚀 Executing query...

✅ Result:
{
  "jira": {
    "issueSearch": {
      "edges": [...],
      "pageInfo": {
        "hasNextPage": true,
        "endCursor": "..."
      }
    }
  }
}
```

## Features

✅ **Dynamic field selection** - Choose exactly what fields you need  
✅ **Nested fields** - Use dot notation for nested data  
✅ **Type-safe** - Built on gqlb's runtime schema validation  
✅ **Beautiful output** - Formatted GraphQL queries and JSON results  
✅ **Environment variables** - Configure once, use everywhere  
✅ **Multiple commands** - Jira, Confluence (coming soon)  

## How It Works

The CLI uses the `gqlb` runtime proxy-based query builder under the hood:

1. Parse command line arguments (issue key, fields, etc.)
2. Use `createQueryBuilder()` from `@your-org/atlassian-graphql`
3. Build query dynamically based on requested fields
4. Execute via GraphQL client
5. Display formatted results

**The magic:** The query builder uses recursive JavaScript Proxies to walk the GraphQL schema at runtime, generating queries on-the-fly with zero code generation!

## Contributing

Add new commands in `src/commands/`:

```typescript
// src/commands/jira/my-command.ts
export async function myCommand(arg: string, options: MyOptions) {
  const builder = createQueryBuilder();
  
  const query = builder.query(q => [
    q.jira(jira => [
      // Your query here
    ])
  ]);
  
  // Execute and display results
}
```

Then register in `src/cli.ts`:

```typescript
import { myCommand } from './commands/jira/my-command';

jira
  .command('my-command <arg>')
  .description('My new command')
  .action(myCommand);
```

## License

MIT

