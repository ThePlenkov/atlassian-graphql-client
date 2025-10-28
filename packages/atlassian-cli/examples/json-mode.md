# JSON Mode Examples

The `--json` flag outputs pure JSON without any decorations, making it perfect for:
- Piping to `jq` or other JSON processors
- Shell scripts and automation
- Integrating with other tools

## Basic Usage

### Pure JSON output
```bash
npx jira get FSINN-1306 --json
# Output: Clean JSON, no emojis, no "Result:" prefix
```

## Piping to jq

### Extract a single field
```bash
npx jira get FSINN-1306 --json | jq -r '.jira.issueByKey.key'
# Output: FSINN-1306
```

### Extract multiple fields into a new object
```bash
npx jira get FSINN-1306 --json | jq '{
  key: .jira.issueByKey.key,
  summary: .jira.issueByKey.summary,
  assignee: .jira.issueByKey.assigneeField.user.name,
  status: .jira.issueByKey.statusField.name
}'
```

### Generate CSV
```bash
npx jira get FSINN-1306 --fields "key,summary,statusField.name" --json | \
  jq -r '[.jira.issueByKey.key, .jira.issueByKey.summary, .jira.issueByKey.statusField.name] | @csv'
# Output: "FSINN-1306","[FS Innovation] - ...","Status"
```

### Check if issue is assigned
```bash
if npx jira get FSINN-1306 --json | jq -e '.jira.issueByKey.assigneeField.user' > /dev/null; then
  echo "Issue is assigned"
else
  echo "Issue is unassigned"
fi
```

## Shell Scripts

### Export to file
```bash
# Save issue data to JSON file
npx jira get FSINN-1306 --all --json > issue-1306.json

# Process later
cat issue-1306.json | jq '.jira.issueByKey | {key, summary, status: .statusField.name}'
```

### Bulk operations
```bash
# Get multiple issues and extract summaries
for issue in FSINN-1306 FSINN-1307 FSINN-1308; do
  summary=$(npx jira get $issue --fields "key,summary" --json | jq -r '.jira.issueByKey.summary')
  echo "$issue: $summary"
done
```

### Filter and transform
```bash
# Get issue and check priority
priority=$(npx jira get FSINN-1306 --fields "priorityField.name" --json | \
  jq -r '.jira.issueByKey.priorityField.name')

if [ "$priority" = "High" ]; then
  echo "High priority issue!"
fi
```

## Comparison: Three Output Modes

### 1. Default (Human-Friendly)
```bash
npx jira get FSINN-1306 --fields "key,summary"
```
**Output:**
```
✅ Result:
{
  "jira": {
    "issueByKey": {
      "key": "FSINN-1306",
      "summary": "..."
    }
  }
}
```

### 2. Verbose (Debug)
```bash
npx jira get FSINN-1306 --fields "key,summary" --verbose
```
**Output:**
```
🔍 Fetching issue: FSINN-1306
📋 Fields: key, summary

📝 Generated GraphQL Query:
────────────────────────────────────────────────────────────
query GetJiraIssue(...) { ... }
────────────────────────────────────────────────────────────

🚀 Executing query...
📍 URL: https://your-company.atlassian.net/gateway/api/graphql
🔐 Auth: Basic
☁️  Cloud ID: ...

✅ Result:
{ ... }
```

### 3. JSON (Pipeable)
```bash
npx jira get FSINN-1306 --fields "key,summary" --json
```
**Output:**
```json
{
  "jira": {
    "issueByKey": {
      "key": "FSINN-1306",
      "summary": "..."
    }
  }
}
```

## Advanced jq Examples

### Conditional formatting
```bash
npx jira get FSINN-1306 --all --json | jq -r '
  .jira.issueByKey |
  if .statusCategory.name == "In Progress" then
    "🚧 \(.key): \(.summary)"
  elif .statusCategory.name == "Done" then
    "✅ \(.key): \(.summary)"
  else
    "📋 \(.key): \(.summary)"
  end
'
```

### Extract nested fields safely
```bash
# Handle null values gracefully
npx jira get FSINN-1306 --all --json | jq -r '
  .jira.issueByKey |
  "Key: \(.key)",
  "Summary: \(.summary)",
  "Due Date: \(.dueDateField.date // "Not set")",
  "Assignee: \(.assigneeField.user.name // "Unassigned")"
'
```

### Create a table
```bash
# Header
echo "KEY,SUMMARY,STATUS,ASSIGNEE"

# Data
npx jira get FSINN-1306 --all --json | jq -r '
  .jira.issueByKey |
  [.key, .summary, .statusField.name, (.assigneeField.user.name // "Unassigned")] |
  @csv
'
```

