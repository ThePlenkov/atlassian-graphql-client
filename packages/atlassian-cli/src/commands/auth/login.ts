/**
 * Custom login command for Atlassian CLI
 * Supports both OAuth and API token authentication
 */

import prompts from 'prompts';
import { loadConfig, saveConfig, saveToken } from '../../auth/config.js';

interface LoginOptions {
  method?: 'token' | 'oauth';
  email?: string;
  token?: string;
  clientId?: string;
  clientSecret?: string;
}

/**
 * Validate API token by testing authentication
 */
async function validateToken(email: string, apiToken: string, baseUrl: string): Promise<boolean> {
  try {
    const basicAuth = Buffer.from(`${email}:${apiToken}`).toString('base64');
    
    const response = await fetch(`${baseUrl}/rest/api/3/myself`, {
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const data: any = await response.json();
      console.log(`\n✅ Authentication successful!`);
      console.log(`   Welcome, ${data.displayName}!`);
      console.log(`   Email: ${data.emailAddress}\n`);
      return true;
    }
    
    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Login with API token (interactive or via flags)
 */
async function loginWithToken(options: LoginOptions): Promise<void> {
  const config = await loadConfig();
  
  // Base URL must be configured - no default
  if (!config.baseUrl) {
    console.error('❌ Error: Atlassian base URL not configured');
    console.error('\n💡 Please add your Atlassian URL to the config file:');
    console.error('   File: ~/.atlassian-tools/config.json');
    console.error('\n   Example:');
    console.error('   {');
    console.error('     "baseUrl": "https://your-company.atlassian.net",');
    console.error('     "auth": {');
    console.error('       "type": "token",');
    console.error('       "token": {}');
    console.error('     }');
    console.error('   }');
    console.error('\n   Or set the ATLASSIAN_BASE_URL environment variable');
    process.exit(1);
  }
  
  const baseUrl = config.baseUrl;
  
  let email = options.email || config.auth?.token?.email;
  let apiToken = options.token;

  // Interactive prompts if not provided
  if (!email || !apiToken) {
    console.log('🔐 API Token Authentication\n');
    
    const responses = await prompts([
      {
        type: !email ? 'text' : null,
        name: 'email',
        message: 'Email address:',
        initial: config.auth?.token?.email || '',
        validate: (value: string) => value.includes('@') ? true : 'Please enter a valid email'
      },
      {
        type: !apiToken ? 'password' : null,
        name: 'apiToken',
        message: 'API Token:',
        validate: (value: string) => value.length > 0 ? true : 'API token cannot be empty'
      }
    ]);

    // Handle Ctrl+C
    if (!responses.email && !email || !responses.apiToken && !apiToken) {
      console.log('\n❌ Login cancelled');
      process.exit(0);
    }

    email = email || responses.email;
    apiToken = apiToken || responses.apiToken;
  }

  // Validate credentials
  console.log('⏳ Validating credentials...');
  
  const isValid = await validateToken(email!, apiToken!, baseUrl);
  
  if (!isValid) {
    console.error('\n❌ Authentication failed');
    console.error('   Please check your email and API token\n');
    console.error('💡 To generate an API token, visit:');
    console.error('   https://id.atlassian.com/manage-profile/security/api-tokens\n');
    process.exit(1);
  }

  // Fetch and save cloud ID
  try {
    const basicAuth = Buffer.from(`${email}:${apiToken}`).toString('base64');
    const tenantRes = await fetch(`${baseUrl}/_edge/tenant_info`, {
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Accept': 'application/json'
      }
    });
    
    if (tenantRes.ok) {
      const { cloudId } = await tenantRes.json() as { cloudId: string };
      config.cloudId = cloudId;
      console.log(`☁️  Cloud ID: ${cloudId}`);
    }
  } catch (error) {
    // Continue even if cloud ID fetch fails
  }

  // Save configuration (email, no token here!)
  config.auth = {
    type: 'token',
    token: { email: email! }
  };
  config.baseUrl = baseUrl;
  
  await saveConfig(config);
  
  // Save token to token.json
  await saveToken(apiToken!);
  
  console.log('\n✅ Login successful!');
  console.log(`   Config: ~/.atlassian-tools/config.json`);
  console.log(`   Token:  ~/.atlassian-tools/token.json\n`);
}

/**
 * Main login command handler
 */
export async function loginCommand(options: LoginOptions): Promise<void> {
  let method = options.method;

  // Interactive method selection if not provided
  if (!method && !options.token && !options.clientId) {
    const response = await prompts({
      type: 'select',
      name: 'method',
      message: 'Select authentication method:',
      choices: [
        { title: 'API Token (Recommended)', value: 'token', description: 'Use personal API token' },
        { title: 'OAuth 2.0', value: 'oauth', description: 'Requires OAuth app registration' }
      ],
      initial: 0
    });

    // Handle Ctrl+C
    if (!response.method) {
      console.log('\n❌ Login cancelled');
      process.exit(0);
    }

    method = response.method;
  }

  // Default to token method if still not determined
  if (!method) {
    method = options.token ? 'token' : 'oauth';
  }

  // Handle based on method
  if (method === 'token') {
    await loginWithToken(options);
  } else {
    console.error('\n❌ OAuth authentication not yet implemented');
    console.error('   Please use --method=token for now\n');
    process.exit(1);
  }
}

