# @atlassian-tools/cli

> 🎯 **Demo Application:** This CLI demonstrates real-world usage of [`gqlb`](../gqlb) with dynamic field selection, OAuth authentication, and interactive commands. It serves as a reference implementation and will be moved to its own repository soon.

**Command-line interface for Atlassian APIs powered by gqlb**

An interactive CLI showcasing [`gqlb`](../gqlb)'s capabilities: dynamic field selection, runtime query building, and full type safety with Atlassian's GraphQL API (8000+ types).

## Architecture

```
@atlassian-tools/cli    (Demo: CLI commands & OAuth)
    ↓
@atlassian-tools/gql    (Demo: Pre-configured gqlb for Atlassian)
    ↓
gqlb                    (Core: Runtime query builder)
```

## 📚 About This Package

This is a **demonstration of gqlb in a real application**. It shows:

- Dynamic field selection at runtime
- OAuth 2.0 authentication flow
- Building complex queries with gqlb
- Interactive CLI with full type safety
- Working with a massive schema (8000+ types)

**Looking for the core library?** Check out [`gqlb`](../gqlb) - it works with any GraphQL API, not just Atlassian.

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
- Store credentials securely

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

## Usage Examples

Once logged in, you can use the CLI without specifying tokens or cloud IDs.

### Jira Commands

#### Get Issue

```bash
# Basic fetch
atlassian jira get PROJ-123

# Specific fields
atlassian jira get PROJ-123 --fields id,key,issueId,webUrl

# Nested fields (dot notation)
atlassian jira get PROJ-123 --fields id,key,summaryField.text,assigneeField.user.name

# JSON output (great for scripting!)
atlassian jira get PROJ-123 --json | jq '.jira.issue.summaryField.text'
```

#### Search Issues

```bash
# Basic search
atlassian jira search "project = DEMO"

# With specific fields
atlassian jira search "project = DEMO" --fields id,key,webUrl --limit 20

# Complex JQL with nested fields
atlassian jira search "assignee = currentUser() AND status = Open" \
  --fields id,key,summaryField.text,statusField.name

# JSON output for scripting
atlassian jira search "project = DEMO" --json | jq '.jira.issueSearch.edges[].node.key'
```

### Development Mode

Run directly without building:

```bash
# From packages/atlassian-cli
npx tsx src/cli.ts login --token YOUR_TOKEN
npx tsx src/cli.ts whoami
npx tsx src/cli.ts jira get PROJ-123 --fields id,key,webUrl
```

## Features

✅ **Dynamic field selection** - Choose fields at runtime (powered by gqlb)
✅ **Nested fields** - Use dot notation for nested data  
✅ **Type-safe** - Full TypeScript autocomplete via gqlb  
✅ **Beautiful output** - Formatted GraphQL queries and JSON results  
✅ **OAuth + Token auth** - Production-ready authentication  
✅ **Stored credentials** - Login once, use everywhere  
✅ **JSON output** - Perfect for scripting with `jq`
✅ **Multiple commands** - Jira, Confluence (coming soon)  

## How It Works

This CLI demonstrates **gqlb's dynamic query building**:

1. **Parse command** - Extract issue key, fields, options
2. **Build query** - Use gqlb to create query at runtime
3. **Execute** - Send to Atlassian GraphQL API
4. **Display** - Format and show results

**The magic:** gqlb uses runtime proxies to walk the GraphQL schema on-the-fly, generating queries with full type safety and zero code generation!

Example from the code:

```typescript
// src/commands/jira/get.ts
import { createQueryBuilder, $$ } from '@atlassian-tools/gql';

const builder = createQueryBuilder();
const issueIdOrKey = $$<string>('issueIdOrKey');

// Dynamic query based on user's --fields option
const query = builder.query('GetIssue', q => [
  q.jira(jira => [
    jira.issueByKeyOrId({ issueIdOrKey }, issue => [
      // Fields selected by user at runtime!
      ...buildFieldsFromUserInput(issue, fields)
    ])
  ])
]);
```

## Sample Output

```bash
$ atlassian jira get PROJ-123 --fields id,key,summaryField.text

🔍 Fetching issue: PROJ-123
📋 Fields: id, key, summaryField.text

📝 Generated GraphQL Query:
────────────────────────────────────────────────────────────
query GetIssue($issueIdOrKey: String!) {
  jira {
    issueByKeyOrId(issueIdOrKey: $issueIdOrKey) {
      id
      key
      summaryField {
        text
      }
    }
  }
}
────────────────────────────────────────────────────────────

🚀 Executing query...

✅ Result:
{
  "jira": {
    "issueByKeyOrId": {
      "id": "10042",
      "key": "PROJ-123",
      "summaryField": {
        "text": "Fix authentication bug"
      }
    }
  }
}
```

## Use This as a Template

Want to build a CLI for your own GraphQL API? This package is a great starting point:

1. Replace `@atlassian-tools/gql` with your own gqlb instance
2. Update commands to match your schema
3. Customize authentication
4. Add your specific commands

See the [`gqlb` documentation](../gqlb) for details on using gqlb with any GraphQL API.

## Contributing

Add new commands in `src/commands/`:

```typescript
// src/commands/jira/my-command.ts
import { createQueryBuilder, $$ } from '@atlassian-tools/gql';

export async function myCommand(arg: string, options: MyOptions) {
  const builder = createQueryBuilder();
  const myVar = $$<string>('myVar');
  
  const query = builder.query('MyQuery', q => [
    q.jira(jira => [
      // Your query here using gqlb!
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

## 🎯 Why This Demo?

This CLI shows gqlb handling real-world challenges:

- **Complex schema** - 8000+ Atlassian types
- **Deep nesting** - 10+ levels of nested objects
- **Dynamic queries** - User chooses fields at runtime
- **Production auth** - OAuth 2.0 with token refresh
- **Great UX** - Beautiful output, error handling

All with:
- ✅ Full type safety
- ✅ Instant autocomplete
- ✅ Tiny bundle size
- ✅ Zero code generation

## 🔗 Related

- **[gqlb](../gqlb)** - The core library (works with any GraphQL API)
- **[@atlassian-tools/gql](../atlassian-graphql)** - Pre-configured gqlb for Atlassian
- **[Innovation Deep Dive](../../docs/INNOVATION.md)** - How gqlb works

## Environment Variables (Optional)

Override stored config with environment variables:

```bash
export ATLASSIAN_TOKEN="your-api-token"
export ATLASSIAN_CLOUD_ID="your-cloud-id"
export ATLASSIAN_API_URL="https://api.atlassian.com/graphql"

atlassian jira get PROJ-123
```

## 📄 License

MIT

---

**This is a demo/reference implementation. For the core library, see [`gqlb`](../gqlb).**
