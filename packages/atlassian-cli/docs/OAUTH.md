# OAuth Implementation

OAuth support for @atlassian-tools/cli, similar to the implementation in [glean-local-mcp](https://github.com/theplenkov-npm/glean-local-mcp).

## Features

✅ **OAuth 2.0 Authorization Code Flow**
- Opens browser for user authorization
- Local callback server on `http://localhost:3000/callback`
- Automatic token exchange

✅ **Token Management**
- Stores tokens in `~/.atlassian-tools/token.json`
- Automatic token refresh using refresh tokens
- Token expiration tracking

✅ **Configuration Storage**
- OAuth client credentials in `~/.atlassian-tools/config.json`
- Cloud ID auto-detection and storage
- Secure file-based storage

✅ **Multiple Auth Methods**
1. **OAuth Flow** (recommended) - Full OAuth 2.0 with refresh tokens
2. **API Token** - Quick start with personal API tokens

## File Structure

```
~/.atlassian-tools/
├── config.json        # OAuth client ID/secret, cloud ID, API URL
└── token.json         # Access token, refresh token, expiration
```

## Implementation Details

### Auth Modules

- **`auth/config.ts`** - Config and token file management
  - `loadConfig()` / `saveConfig()` - Config file operations
  - `loadToken()` / `saveToken()` - Token file operations
  - `getValidToken()` - Get valid token, auto-refresh if expired
  - `isTokenExpired()` - Check token expiration

- **`auth/oauth.ts`** - OAuth flow implementation
  - `startOAuthFlow()` - Initiate OAuth authorization
  - `waitForCallback()` - Local server for OAuth callback
  - `exchangeCodeForToken()` - Exchange auth code for tokens
  - `getAccessibleResources()` - Fetch available Cloud IDs

### Commands

- **`atlassian login`** - Login via OAuth or API token
  - `--client-id` and `--client-secret` for OAuth
  - `--token` for direct API token
  - Auto-fetches and stores Cloud IDs
  
- **`atlassian logout`** - Clear stored tokens

- **`atlassian whoami`** - Display auth status
  - Shows config file locations
  - Token status and expiration
  - User permissions (if token is valid)

### Token Refresh Flow

```typescript
// Automatic token refresh
const token = await getValidToken();

// Checks:
// 1. Token exists?
// 2. Token expired?
// 3. Refresh token available?
// 4. Client credentials stored?
// → Automatically refreshes if needed
```

## OAuth Flow Diagram

```
1. User runs: atlassian login --client-id X --client-secret Y

2. CLI generates authorization URL:
   https://auth.atlassian.com/authorize
     ?client_id=X
     &redirect_uri=http://localhost:3000/callback
     &scope=read:jira-work offline_access
     &response_type=code

3. CLI starts local server on port 3000

4. User opens URL in browser, authorizes app

5. Atlassian redirects to: http://localhost:3000/callback?code=ABC123

6. CLI receives code, exchanges for tokens:
   POST https://auth.atlassian.com/oauth/token
   {
     grant_type: "authorization_code",
     client_id: X,
     client_secret: Y,
     code: "ABC123"
   }

7. CLI saves tokens to ~/.atlassian-tools/token.json

8. CLI fetches Cloud IDs, saves to config.json

9. Done! User can now run commands without --token
```

## Token Refresh Flow

```
1. User runs: atlassian jira get ISSUE-123

2. CLI calls: getValidToken()

3. Check if token expired:
   if (Date.now() >= token.expires_at) {
     // Token expired!
   }

4. If expired and refresh_token exists:
   POST https://auth.atlassian.com/oauth/token
   {
     grant_type: "refresh_token",
     client_id: X,
     client_secret: Y,
     refresh_token: "refresh_abc"
   }

5. Save new tokens to token.json

6. Continue with refreshed token
```

## Usage Examples

### OAuth Login

```bash
# Create OAuth app at: https://developer.atlassian.com/console/myapps/

atlassian login \
  --client-id "YOUR_CLIENT_ID" \
  --client-secret "YOUR_CLIENT_SECRET"

# Browser opens, user authorizes
# Tokens saved to ~/.atlassian-tools/

atlassian whoami
# ✅ Logged in
# Token expires in: 3600 minutes
# Cloud ID: abc-123-def

atlassian jira get ISSUE-123
# Uses stored token automatically!
```

### API Token Login

```bash
# Generate token at: https://id.atlassian.com/manage-profile/security/api-tokens

atlassian login --token "YOUR_API_TOKEN"

# Token saved, ready to use!

atlassian jira get ISSUE-123
```

### Check Status

```bash
atlassian whoami

# Output:
# 📁 Configuration:
#    Config dir:  ~/.atlassian-tools
#    Config file: ~/.atlassian-tools/config.json
#    Token file:  ~/.atlassian-tools/token.json
#
# ✅ Logged in
#
# Token info:
#    Type: Bearer
#    Has refresh token: Yes
#    Expires: ✅ In 3540 minutes
#    Scopes: read:jira-work write:jira-work offline_access
#
# Cloud ID: abc-123-def
```

### Logout

```bash
atlassian logout

# ✅ Logged out successfully!
# Your token has been removed from:
#    ~/.atlassian-tools/token.json
```

## Security Considerations

1. **Token Storage**
   - Tokens stored in user's home directory
   - File permissions: 600 (user read/write only)
   - No encryption (relies on filesystem permissions)

2. **Client Secret**
   - Stored in `config.json` for token refresh
   - Should use OAuth PKCE for public clients (future enhancement)

3. **Local Server**
   - Runs on localhost:3000 for OAuth callback
   - Listens only during authorization (closed after)
   - 5-minute timeout for security

## Future Enhancements

- [ ] PKCE (Proof Key for Code Exchange) for public clients
- [ ] Encrypted token storage
- [ ] Multiple profile support
- [ ] Token encryption at rest
- [ ] Support for organization-specific OAuth endpoints

## References

- [Atlassian OAuth 2.0 Documentation](https://developer.atlassian.com/cloud/jira/platform/oauth-2-3lo-apps/)
- [OAuth 2.0 Authorization Code Flow](https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow)
- Similar implementation: [glean-local-mcp](https://github.com/theplenkov-npm/glean-local-mcp)

