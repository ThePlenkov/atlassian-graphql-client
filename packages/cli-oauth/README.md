# cli-oauth

Generic OAuth 2.0 authentication for CLI applications with async file I/O and atomic writes.

## Features

- 🔐 **OAuth 2.0 Authorization Code Flow** - Full OAuth implementation with local callback server
- 🔄 **Automatic Token Refresh** - Handles token expiration automatically
- 💾 **Secure Storage** - Atomic file operations to prevent corruption
- ⚡ **Async First** - Modern Node.js `fs/promises` APIs throughout
- 🎯 **Provider Agnostic** - Works with any OAuth 2.0 provider
- 🔧 **Commander Integration** - Drop-in auth commands for CLI apps
- 📦 **Zero Dependencies** (except `commander` and `open`)

## Installation

```bash
npm install cli-oauth commander open
```

## Usage

There are **two ways** to use `cli-oauth`:

### 1. Direct API Usage (CLIAuth class)

Use the `CLIAuth` class directly for full control:

```typescript
import { CLIAuth } from 'cli-oauth';

// Define your config interface
interface MyAppConfig {
  apiUrl?: string;
  defaultProject?: string;
}

// Create auth instance
const auth = new CLIAuth<MyAppConfig>({
  serviceName: 'my-app', // Used for ~/.my-app directory
});

// Configure OAuth
auth.setOAuthConfig({
  serviceName: 'my-app',
  authUrl: 'https://oauth.provider.com/authorize',
  tokenUrl: 'https://oauth.provider.com/token',
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  scopes: ['read', 'write'],
  callbackPort: 3000,
});

// Login via OAuth
const token = await auth.loginOAuth();
console.log('Access token:', token.access_token);

// Or login with direct token
await auth.loginToken('your-api-token');

// Get valid token (auto-refreshes if needed)
const accessToken = await auth.getValidToken();

// Get token info
const info = await auth.getTokenInfo();
console.log('Expires in:', info.expiresIn, 'seconds');

// Config management
await auth.saveConfig({ apiUrl: 'https://api.example.com' });
const config = await auth.getConfig();

// Logout
await auth.logout();
```

### 2. Commander Integration (Auth Commands)

Attach ready-made auth commands to your CLI:

```typescript
import { Command } from 'commander';
import { CLIAuth, createAuthCommand } from 'cli-oauth';

interface MyAppConfig {
  cloudId?: string;
  apiUrl?: string;
}

// Create auth instance
const auth = new CLIAuth<MyAppConfig>({
  serviceName: 'my-app',
});

// Create your main CLI program
const program = new Command()
  .name('my-app')
  .description('My awesome CLI')
  .version('1.0.0');

// Create and attach auth commands
const authCmd = createAuthCommand({
  auth,
  
  // Optional: Custom post-login handler
  onLoginSuccess: async (token) => {
    // Fetch and save additional resources
    const resources = await fetchMyResources(token.access_token);
    const config = await auth.getConfig();
    await auth.saveConfig({
      ...config,
      cloudId: resources[0].id,
    });
  },
  
  // Optional: Fetch accessible resources
  fetchResources: async (accessToken) => {
    const response = await fetch('https://api.example.com/resources', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return response.json();
  },
  
  // Optional: Format resource for display
  formatResource: (resource, index) => {
    return `${index + 1}. ${resource.name}\n   ID: ${resource.id}\n`;
  },
  
  // Optional: OAuth instructions
  oauthInstructions: 'Visit https://example.com/oauth to create credentials',
});

// Set OAuth config before login (using Commander hooks)
const loginCmd = authCmd.commands.find(cmd => cmd.name() === 'login');
if (loginCmd) {
  loginCmd.hook('preAction', (thisCommand) => {
    const opts = thisCommand.opts();
    if (opts.clientId && opts.clientSecret) {
      auth.setOAuthConfig({
        serviceName: 'my-app',
        authUrl: 'https://oauth.provider.com/authorize',
        tokenUrl: 'https://oauth.provider.com/token',
        clientId: opts.clientId,
        clientSecret: opts.clientSecret,
        scopes: ['read', 'write'],
      });
    }
  });
}

// Attach auth commands
program.addCommand(authCmd);

// Add your own commands
program
  .command('do-something')
  .action(async () => {
    const token = await auth.getValidToken();
    if (!token) {
      console.error('Please login first: my-app auth login');
      process.exit(1);
    }
    // Do something with token...
  });

program.parse();
```

This gives you these commands automatically:

```bash
# Login with OAuth
my-app auth login --client-id YOUR_ID --client-secret YOUR_SECRET

# Login with API token
my-app auth login --token YOUR_TOKEN

# Check authentication status
my-app auth whoami

# Logout
my-app auth logout
```

## API Reference

### CLIAuth Class

#### Constructor

```typescript
new CLIAuth<TConfig>(options: CLIAuthOptions)
```

**Options:**
- `serviceName`: Service name (used for `~/.{serviceName}` directory)
- `baseDir?`: Optional custom base directory

#### Methods

##### `setOAuthConfig(config: OAuthConfig)`

Configure OAuth settings.

```typescript
auth.setOAuthConfig({
  serviceName: 'my-app',
  authUrl: 'https://oauth.provider.com/authorize',
  tokenUrl: 'https://oauth.provider.com/token',
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  scopes: ['read', 'write'],
  redirectUri: 'http://localhost:3000/callback', // Optional
  callbackPort: 3000, // Optional
  additionalParams: { // Optional
    audience: 'api.example.com',
    prompt: 'consent',
  },
});
```

##### `loginOAuth(): Promise<Token>`

Start OAuth authorization code flow. Opens browser, waits for callback, exchanges code for token.

##### `loginToken(accessToken: string): Promise<void>`

Save an API token directly (bypasses OAuth).

##### `logout(): Promise<void>`

Clear stored credentials.

##### `getValidToken(): Promise<string | null>`

Get current access token, auto-refreshing if expired (requires refresh token).

##### `getTokenInfo(): Promise<TokenInfo>`

Get information about current token:

```typescript
{
  hasToken: boolean;
  isExpired: boolean;
  expiresIn?: number; // seconds until expiration
  hasRefreshToken: boolean;
}
```

##### Config Management

```typescript
await auth.saveConfig(config: TConfig): Promise<void>
const config = await auth.getConfig(): Promise<TConfig | null>
await auth.updateConfig(updateFn): Promise<TConfig>
await auth.getConfigValue<K>(key: K): Promise<TConfig[K] | undefined>
await auth.setConfigValue<K>(key: K, value: TConfig[K]): Promise<void>
```

##### `getPaths(): { configDir, configFile, tokenFile }`

Get paths to config and token files.

### createAuthCommand Function

```typescript
createAuthCommand<TConfig>(options: AuthCommandOptions<TConfig>): Command
```

**Options:**
- `auth`: CLIAuth instance
- `onLoginSuccess?`: Callback after successful login
- `fetchResources?`: Function to fetch accessible resources
- `formatResource?`: Function to format resource for display
- `oauthInstructions?`: Instructions for obtaining OAuth credentials

**Returns:** Commander `Command` object with three subcommands:
- `login` - Login via OAuth or token
- `logout` - Clear credentials
- `whoami` - Display auth status

## Storage

Credentials are stored in `~/.{serviceName}/`:

- `config.json` - Non-sensitive configuration
- `token.json` - Access and refresh tokens

All file operations use:
- ✅ **Async I/O** - `fs/promises` for non-blocking operations
- ✅ **Atomic writes** - Write to temp file, then rename (prevents corruption)
- ✅ **Secure permissions** - Files created with `0o600` (owner read/write only)

## Real-World Example

See `@atlassian-tools/cli` for a complete example of using `cli-oauth` with the Atlassian API:

```typescript
// packages/atlassian-cli/src/cli.ts
import { CLIAuth, createAuthCommand } from 'cli-oauth';

const auth = new CLIAuth<AtlassianConfig>({
  serviceName: 'atlassian-tools',
});

const authCmd = createAuthCommand({
  auth,
  onLoginSuccess: async (token) => {
    // Fetch Atlassian cloud IDs
    const resources = await getAccessibleResources(token.access_token);
    if (resources.length > 0) {
      const config = await auth.getConfig();
      await auth.saveConfig({
        ...config,
        cloudId: resources[0].id,
      });
    }
  },
  fetchResources: getAccessibleResources,
  formatResource: (resource, index) => {
    return `${index + 1}. ${resource.name}\n   Cloud ID: ${resource.id}\n   URL: ${resource.url}\n`;
  },
  oauthInstructions: 'To create an OAuth app, visit:\n  https://developer.atlassian.com/console/myapps/',
});

program.addCommand(authCmd);
```

## TypeScript Support

Fully typed with generics for your custom config:

```typescript
interface MyConfig {
  apiUrl?: string;
  projectId?: string;
  theme?: 'light' | 'dark';
}

const auth = new CLIAuth<MyConfig>({
  serviceName: 'my-app',
});

// TypeScript knows about your config structure
await auth.saveConfig({
  apiUrl: 'https://api.example.com',
  theme: 'dark',
});

const theme = await auth.getConfigValue('theme'); // Type: 'light' | 'dark' | undefined
```

## Error Handling

```typescript
try {
  const token = await auth.loginOAuth();
  console.log('Login successful!');
} catch (error) {
  if (error.message.includes('timeout')) {
    console.error('OAuth flow timed out');
  } else if (error.message.includes('denied')) {
    console.error('User denied authorization');
  } else {
    console.error('Login failed:', error.message);
  }
}
```

## License

ISC
