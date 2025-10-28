# Configuration Guide

## Overview

The Atlassian CLI stores configuration in two separate files:
- **`~/.atlassian-tools/config.json`** - Non-sensitive settings (instance URL, auth type, email)
- **`~/.atlassian-tools/token.json`** - Sensitive credentials (API tokens, OAuth tokens)

## Required Configuration

### Base URL (REQUIRED!)

You **must** configure your Atlassian instance URL. There is no default.

```json
{
  "baseUrl": "https://your-company.atlassian.net"
}
```

**Common mistakes to avoid:**
- ❌ Don't hardcode company-specific URLs in the tool
- ❌ Don't assume everyone uses the same Atlassian instance
- ✅ Always require explicit configuration

## Authentication Methods

### 1. API Token Authentication (Recommended)

**`~/.atlassian-tools/config.json`:**
```json
{
  "baseUrl": "https://your-company.atlassian.net",
  "cloudId": "your-cloud-id",
  "auth": {
    "type": "token",
    "token": {
      "email": "your.email@company.com"
    }
  }
}
```

**`~/.atlassian-tools/token.json`:**
```json
{
  "access_token": "ATATT3xFfGF0..."
}
```

**How to get an API token:**
1. Visit https://id.atlassian.com/manage-profile/security/api-tokens
2. Create a new API token
3. Run `npx jira auth login` and enter your email and token

### 2. OAuth 2.0 (Advanced)

**`~/.atlassian-tools/config.json`:**
```json
{
  "baseUrl": "https://your-company.atlassian.net",
  "cloudId": "your-cloud-id",
  "auth": {
    "type": "oauth",
    "oauth": {
      "clientId": "YOUR_CLIENT_ID",
      "clientSecret": "YOUR_CLIENT_SECRET",
      "scopes": ["read:jira:site-admin", "offline_access"]
    }
  }
}
```

**`~/.atlassian-tools/token.json`:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "def50200...",
  "expires_at": 1234567890
}
```

## Environment Variables

You can override config values with environment variables:

```bash
export ATLASSIAN_BASE_URL="https://your-company.atlassian.net"
export ATLASSIAN_TOKEN="ATATT3xFfGF0..."
export ATLASSIAN_API_URL="https://your-company.atlassian.net/gateway/api/graphql"

npx jira get ISSUE-123
```

## Security Best Practices

### What to Commit to Git

**✅ Safe to commit (example template):**
```json
{
  "baseUrl": "https://YOUR_COMPANY.atlassian.net",
  "auth": {
    "type": "token",
    "token": {
      "email": "YOUR_EMAIL@company.com"
    }
  }
}
```

**❌ NEVER commit:**
- `~/.atlassian-tools/token.json` (contains credentials!)
- Actual API tokens or OAuth secrets
- Actual email addresses
- Cloud IDs (can be sensitive)

### File Permissions

The token file is automatically created with restricted permissions:

```bash
chmod 600 ~/.atlassian-tools/token.json
```

## Multi-Environment Setup

You can maintain different configurations for different environments:

```bash
# Production
export ATLASSIAN_BASE_URL="https://company.atlassian.net"

# Staging
export ATLASSIAN_BASE_URL="https://company-staging.atlassian.net"

# Dev
export ATLASSIAN_BASE_URL="https://company-dev.atlassian.net"
```

## Troubleshooting

### "Atlassian base URL not configured"

This means you need to set up your config file:

```bash
mkdir -p ~/.atlassian-tools
cat > ~/.atlassian-tools/config.json << 'EOF'
{
  "baseUrl": "https://your-company.atlassian.net",
  "auth": {
    "type": "token",
    "token": {
      "email": "your.email@company.com"
    }
  }
}
EOF
```

Then run login:
```bash
npx jira auth login
```

### "Cloud ID not found"

The cloud ID is fetched automatically during login. If missing:
1. Run `npx jira auth logout`
2. Run `npx jira auth login` again
3. The cloud ID will be fetched and saved

### "Authentication failed"

Check:
1. Is your API token valid? (Check https://id.atlassian.com/manage-profile/security/api-tokens)
2. Is your email correct in `config.json`?
3. Is your `baseUrl` correct?
4. Do you have access to the Atlassian instance?

## MCP Server Configuration

For MCP servers, you can pass configuration programmatically:

```typescript
import { getIssue, SilentLogger } from '@atlassian-tools/cli';

const result = await getIssue('ISSUE-123', {
  logger: new SilentLogger(),
  json: true,
  // Config is read from ~/.atlassian-tools/config.json
  // or set via environment variables
});
```

## Migration from Old Config

If you have an old config with hardcoded URLs or flat structure:

**Old (deprecated):**
```json
{
  "clientId": "...",
  "clientSecret": "...",
  "apiToken": "..."
}
```

**New:**
```json
{
  "baseUrl": "https://your-company.atlassian.net",
  "auth": {
    "type": "token",
    "token": {
      "email": "your.email@company.com"
    }
  }
}
```

And token goes to `token.json`:
```json
{
  "access_token": "ATATT3xFfGF0..."
}
```
