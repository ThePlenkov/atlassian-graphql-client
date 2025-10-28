/**
 * Login command
 */

import type { CLIAuth } from '../../cli-auth.js';

export interface LoginOptions {
  clientId?: string;
  clientSecret?: string;
  token?: string;
}

export interface LoginHandlers {
  /**
   * Read OAuth credentials from config storage
   * Allows each CLI to implement its own config structure
   */
  getOAuthCredentials?: () => Promise<{ clientId?: string; clientSecret?: string }>;

  /**
   * Called after successful login
   */
  onLoginSuccess?: (token: { access_token: string; refresh_token?: string }) => Promise<void>;

  /**
   * Fetch accessible resources after login
   */
  fetchResources?: (accessToken: string) => Promise<any[]>;

  /**
   * Format resource for display
   */
  formatResource?: (resource: any, index: number) => string;
}

export async function loginCommand<TConfig>(
  auth: CLIAuth<TConfig>,
  options: LoginOptions,
  handlers: LoginHandlers,
  oauthInstructions: string
): Promise<void> {
  const { onLoginSuccess, fetchResources, formatResource } = handlers;

  // Option 1: Direct token (for testing or API tokens)
  if (options.token) {
    console.log('\n💾 Saving token...\n');
    
    await auth.loginToken(options.token);

    // Try to fetch resources if handler provided
    if (fetchResources) {
      try {
        const resources = await fetchResources(options.token);
        if (resources.length > 0) {
          console.log('📋 Available Resources:\n');
          resources.forEach((resource: any, index: number) => {
            if (formatResource) {
              console.log(formatResource(resource, index));
            } else {
              console.log(`${index + 1}. ${JSON.stringify(resource, null, 2)}\n`);
            }
          });
        }
      } catch (error) {
        console.log('⚠️  Could not fetch resources. You may need to configure them manually.\n');
      }
    }

    // Call custom success handler
    if (onLoginSuccess) {
      await onLoginSuccess({ access_token: options.token });
    }

    console.log('✅ Token saved successfully!\n');
    return;
  }

  // Option 2: OAuth flow
  // Try to read credentials from config if not provided via CLI
  let clientId = options.clientId;
  let clientSecret = options.clientSecret;
  let isPKCEFlow = false;

  if ((!clientId || !clientSecret) && handlers.getOAuthCredentials) {
    const configCreds = await handlers.getOAuthCredentials();
    clientId = clientId || configCreds.clientId;
    clientSecret = clientSecret || configCreds.clientSecret;
    
    // If getOAuthCredentials returns empty object, it means PKCE flow (no credentials needed)
    if (!clientId && !clientSecret && Object.keys(configCreds).length === 0) {
      isPKCEFlow = true;
      clientId = 'pkce-flow'; // Dummy value to pass validation
      clientSecret = 'not-needed'; // Dummy value for PKCE
    }
  }

  if (!clientId || (!clientSecret && !isPKCEFlow)) {
    const paths = auth.getPaths();
    const configExists = await auth.configExists();
    
    console.error('❌ Error: OAuth login requires --client-id and --client-secret\n');
    
    if (configExists) {
      console.error(`📝 Config file found at: ${paths.configFile}\n`);
      console.error('Please edit it to add OAuth credentials:\n');
      console.error('   {');
      console.error('     "auth": {');
      console.error('       "type": "oauth",');
      console.error('       "oauth": {');
      console.error('         "clientId": "YOUR_CLIENT_ID",');
      console.error('         "clientSecret": "YOUR_CLIENT_SECRET"');
      console.error('       }');
      console.error('     }');
      console.error('   }\n');
    } else {
      console.error('You have two options:\n');
      console.error('1. Pass credentials as command-line arguments:');
      console.error('   <command> auth login --client-id YOUR_CLIENT_ID --client-secret YOUR_CLIENT_SECRET\n');
      console.error('2. Create a config file to avoid passing them every time:');
      console.error(`   ${paths.configFile}\n`);
      console.error('   Example config.json:');
      console.error('   {');
      console.error('     "auth": {');
      console.error('       "type": "oauth",');
      console.error('       "oauth": {');
      console.error('         "clientId": "YOUR_CLIENT_ID",');
      console.error('         "clientSecret": "YOUR_CLIENT_SECRET"');
      console.error('       }');
      console.error('     }');
      console.error('   }\n');
    }
    
    console.error('Or use a token directly:');
    console.error('   <command> auth login --token YOUR_TOKEN\n');
    console.error(oauthInstructions);
    process.exit(1);
  }

  // Update options with credentials from config
  options.clientId = clientId;
  options.clientSecret = clientSecret;

  // Start OAuth flow
  console.log('\n🔐 Starting OAuth flow...\n');
  const token = await auth.loginOAuth();

  // Fetch resources if handler provided
  if (fetchResources) {
    try {
      const resources = await fetchResources(token.access_token);
      if (resources.length > 0) {
        console.log('📋 Available Resources:\n');
        resources.forEach((resource: any, index: number) => {
          if (formatResource) {
            console.log(formatResource(resource, index));
          } else {
            console.log(`${index + 1}. ${JSON.stringify(resource, null, 2)}\n`);
          }
        });
      }
    } catch (error) {
      console.log('⚠️  Could not fetch resources.\n');
    }
  }

  // Call custom success handler
  if (onLoginSuccess) {
    await onLoginSuccess(token);
  }

  console.log('✅ Login successful!\n');
}

