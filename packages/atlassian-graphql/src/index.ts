/**
 * Atlassian GraphQL SDK
 * 
 * A fully typed SDK for Atlassian's GraphQL API.
 * Configure operations in sdk.config.ts and run `npm run gen` to regenerate.
 * 
 * @example
 * ```ts
 * import { GraphQLClient } from 'graphql-request';
 * import { getSdk } from '@your-org/atlassian-graphql';
 * 
 * const client = new GraphQLClient('https://api.atlassian.com/graphql', {
 *   headers: {
 *     authorization: `Bearer ${process.env.ATLASSIAN_TOKEN}`,
 *   },
 * });
 * 
 * const sdk = getSdk(client);
 * 
 * // Fully typed operations
 * const issue = await sdk.Issue({ id: 'issue-123' });
 * const spaces = await sdk.FindSpaces({ cloudId: 'cloud-id' });
 * ```
 */

export * from './generated/sdk';

// Re-export GraphQLClient for convenience
export { GraphQLClient } from 'graphql-request';
