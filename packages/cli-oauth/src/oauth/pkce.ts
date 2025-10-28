/**
 * PKCE (Proof Key for Code Exchange) utilities
 * RFC 7636: https://tools.ietf.org/html/rfc7636
 */

import { randomBytes, createHash } from 'crypto';

/**
 * Generate a cryptographically random code verifier
 * @returns A base64url-encoded random string (43-128 characters)
 */
export function generateCodeVerifier(): string {
  // Generate 32 random bytes (will be 43 characters when base64url encoded)
  return base64URLEncode(randomBytes(32));
}

/**
 * Generate a code challenge from a code verifier using SHA256
 * @param verifier The code verifier
 * @returns A base64url-encoded SHA256 hash of the verifier
 */
export function generateCodeChallenge(verifier: string): string {
  // SHA256 hash of the verifier
  const hash = createHash('sha256')
    .update(verifier)
    .digest();
  
  return base64URLEncode(hash);
}

/**
 * Base64URL encoding (without padding)
 * @param buffer Buffer to encode
 * @returns Base64URL encoded string
 */
function base64URLEncode(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}


