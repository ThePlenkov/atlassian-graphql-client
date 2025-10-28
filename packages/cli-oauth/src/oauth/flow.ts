/**
 * Generic OAuth 2.0 authorization code flow
 */

import { createServer, IncomingMessage, ServerResponse } from 'http';
import { parse as parseUrl } from 'url';
import open from 'open';
import type { OAuthConfig, TokenResponse } from './types.js';
import type { Token } from '../storage/token-manager';

const DEFAULT_REDIRECT_URI = 'http://localhost:3000/callback';
const DEFAULT_PORT = 3000;
const DEFAULT_TIMEOUT = 5 * 60 * 1000; // 5 minutes

/**
 * Start OAuth authorization flow
 */
export async function startOAuthFlow(config: OAuthConfig): Promise<Token> {
  const redirectUri = config.redirectUri || DEFAULT_REDIRECT_URI;
  const port = config.callbackPort || DEFAULT_PORT;
  const timeout = config.timeout || DEFAULT_TIMEOUT;

  // Build authorization URL (with PKCE if enabled)
  const { url: authUrl, codeVerifier } = await buildAuthorizationUrl(config, redirectUri);

  console.log('\n🔐 Starting OAuth flow...\n');
  console.log('Opening browser for authorization...\n');
  console.log('If browser doesn\'t open, visit:\n');
  console.log(authUrl);
  console.log('\n📡 Waiting for authorization...\n');

  // Open browser
  try {
    await open(authUrl);
  } catch (error) {
    console.log('⚠️  Could not open browser automatically');
  }

  // Wait for callback
  const code = await waitForCallback(port, timeout);

  console.log('✅ Authorization received\n');
  console.log('🔄 Exchanging code for token...\n');

  // Exchange code for token (with code_verifier if PKCE)
  const token = await exchangeCodeForToken(config, code, redirectUri, codeVerifier);

  console.log('✅ Token obtained successfully!\n');

  return token;
}

/**
 * Build authorization URL
 */
async function buildAuthorizationUrl(
  config: OAuthConfig,
  redirectUri: string
): Promise<{ url: string; codeVerifier?: string }> {
  const url = new URL(config.authUrl);
  
  url.searchParams.set('client_id', config.clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  
  // Only add scope if scopes are provided
  if (config.scopes && config.scopes.length > 0) {
    url.searchParams.set('scope', config.scopes.join(' '));
  }

  let codeVerifier: string | undefined;

  // Add PKCE parameters if enabled
  if (config.usePKCE) {
    const { generateCodeVerifier, generateCodeChallenge } = await import('./pkce.js');
    codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    
    url.searchParams.set('code_challenge', codeChallenge);
    url.searchParams.set('code_challenge_method', 'S256');
  }

  // Add additional provider-specific params
  if (config.additionalParams) {
    for (const [key, value] of Object.entries(config.additionalParams)) {
      url.searchParams.set(key, value);
    }
  }

  return { url: url.toString(), codeVerifier };
}

/**
 * Wait for OAuth callback
 */
function waitForCallback(port: number, timeout: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const server = createServer((req: IncomingMessage, res: ServerResponse) => {
      const { pathname, query } = parseUrl(req.url || '', true);
      
      console.log(`📥 Received callback request: ${req.url}`);
      console.log(`   Pathname: ${pathname}`);
      console.log(`   Code: ${query.code ? 'present' : 'missing'}`);

      // Support root path (for MCP) and /callback, /oauth/callback for traditional OAuth
      if (pathname === '/' || pathname === '/callback' || pathname === '/oauth/callback') {
        const code = query.code as string;
        const error = query.error as string;

        if (error) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end(getErrorHtml(error));
          server.close();
          reject(new Error(`OAuth error: ${error}`));
          return;
        }

        if (code) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(getSuccessHtml());
          server.close();
          resolve(code);
          return;
        }

        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(getErrorHtml('No authorization code received'));
        server.close();
        reject(new Error('No authorization code received'));
        return;
      }
      
      // Handle unmatched paths
      console.log(`⚠️  Unmatched path: ${pathname}`);
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<html><body><h1>404 Not Found</h1></body></html>');
    });

    server.listen(port, '127.0.0.1', () => {
      console.log(`📡 Callback server listening on http://127.0.0.1:${port}`);
    });

    // Timeout
    setTimeout(() => {
      server.close();
      reject(new Error(`OAuth flow timed out after ${timeout / 1000} seconds`));
    }, timeout);
  });
}

/**
 * Exchange authorization code for access token
 */
async function exchangeCodeForToken(
  config: OAuthConfig,
  code: string,
  redirectUri: string,
  codeVerifier?: string
): Promise<Token> {
  const params: Record<string, string> = {
    grant_type: 'authorization_code',
    client_id: config.clientId,
    code,
    redirect_uri: redirectUri,
  };

  // Use code_verifier for PKCE flow, client_secret for traditional flow
  if (config.usePKCE && codeVerifier) {
    params.code_verifier = codeVerifier;
  } else if (config.clientSecret) {
    params.client_secret = config.clientSecret;
  }

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(params).toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('\n❌ Token exchange failed:');
    console.error(`   Status: ${response.status} ${response.statusText}`);
    console.error(`   Response: ${error}\n`);
    throw new Error(`Failed to exchange code for token (${response.status}): ${error}`);
  }

  const data = (await response.json()) as TokenResponse;

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_in ? Date.now() + data.expires_in * 1000 : undefined,
    token_type: data.token_type,
    scope: data.scope,
  };
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(
  config: OAuthConfig,
  refreshToken: string
): Promise<Token> {
  const params: Record<string, string> = {
    grant_type: 'refresh_token',
    client_id: config.clientId,
    refresh_token: refreshToken,
  };

  // Client secret not needed for PKCE refresh in some implementations
  if (config.clientSecret && !config.usePKCE) {
    params.client_secret = config.clientSecret;
  }

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(params).toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh token: ${error}`);
  }

  const data = (await response.json()) as TokenResponse;

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token || refreshToken,
    expires_at: data.expires_in ? Date.now() + data.expires_in * 1000 : undefined,
    token_type: data.token_type,
    scope: data.scope,
  };
}

/**
 * HTML templates
 */
function getSuccessHtml(): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Authorization Successful</title>
        <style>
          body { font-family: system-ui; text-align: center; padding: 50px; }
          h1 { color: #10b981; }
        </style>
      </head>
      <body>
        <h1>✅ Authorization Successful!</h1>
        <p>You can close this window and return to the terminal.</p>
      </body>
    </html>
  `;
}

function getErrorHtml(error: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Authorization Failed</title>
        <style>
          body { font-family: system-ui; text-align: center; padding: 50px; }
          h1 { color: #ef4444; }
        </style>
      </head>
      <body>
        <h1>❌ Authorization Failed</h1>
        <p>Error: ${error}</p>
        <p>You can close this window and try again.</p>
      </body>
    </html>
  `;
}

