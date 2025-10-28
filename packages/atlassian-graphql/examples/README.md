# Jira CLI Examples

A simple CLI demonstrating the **recursive proxy-based query builder** (`gqlb`) in action.

## Installation

```bash
npm install
```

## Usage

```bash
npx tsx examples/jira-cli.ts get issue <ISSUE-KEY> [--fields <field1,field2,...>]
```

## Examples

### Basic Fields

```bash
# Get basic issue information
npx tsx examples/jira-cli.ts get issue FSINN-123 --fields id,key,issueId
```

**Generated Query:**
```graphql
query ($issueId: ID!) {
  jira {
    issue(id: $issueId) {
      id
      key
      issueId
    }
  }
}
```

### Default Fields

```bash
# Uses default fields: id, key, webUrl
npx tsx examples/jira-cli.ts get issue FSINN-123
```

### Nested Fields (Dot Notation)

```bash
# Access nested fields using dot notation
npx tsx examples/jira-cli.ts get issue FSINN-123 --fields id,key,summaryField.text
```

**Generated Query:**
```graphql
query ($issueId: ID!) {
  jira {
    issue(id: $issueId) {
      id
      key
      summaryField {
        text
      }
    }
  }
}
```

## How the Recursive Proxy Works

When you run:
```bash
npx tsx examples/jira-cli.ts get issue FSINN-123 --fields id,key,webUrl
```

Here's what happens under the hood:

1. **Parse fields**: `['id', 'key', 'webUrl']`

2. **Build query with proxy navigation**:
   ```typescript
   builder.query(q =>           // Proxy for Query type
     [q.jira(jira =>            // Proxy intercepts "jira" → creates JiraQuery proxy
       [jira.issue(issue =>     // Proxy intercepts "issue" → creates JiraIssue proxy
         [
           issue.id(),          // Proxy intercepts "id" → scalar field
           issue.key(),         // Proxy intercepts "key" → scalar field  
           issue.webUrl()       // Proxy intercepts "webUrl" → scalar field
         ]
       )]
     )]
   )
   ```

3. **Each proxy lookup**:
   - Checks if field exists in the GraphQL schema
   - For object types: **recursively creates a new Proxy**
   - For scalar types: returns the field selection
   - Builds the GraphQL query string progressively

4. **Result**: A valid `TypedDocumentNode` ready to execute

## With Real API Credentials

Set your Atlassian token:

```bash
export ATLASSIAN_TOKEN="your-token-here"
npx tsx examples/jira-cli.ts get issue FSINN-123 --fields id,key,webUrl
```

The CLI will execute the query and return the actual data from Jira.

## Benefits of This Approach

✅ **Zero Code Generation** - No 132k line files!  
✅ **Dynamic Field Selection** - Choose exactly what you need  
✅ **Type-Safe** - Schema validation at runtime  
✅ **Recursive** - Handles nested fields automatically  
✅ **Small Bundle** - Only ~300 lines of runtime code + schema  

## Advanced Usage

You can modify the CLI to support:
- Multiple issue keys
- Filtering and sorting
- Pagination
- Different output formats (JSON, table, etc.)
- GraphQL mutations

The recursive proxy approach makes it easy to build any GraphQL query dynamically!

