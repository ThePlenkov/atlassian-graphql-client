/**
 * Test scenario: Query result access with AUTOMATIC TYPE INFERENCE! 🎯
 * 
 * This test demonstrates the COMPLETE flow:
 * 1. Build a query with object-based selections using gqlb
 * 2. Execute it with a mock GraphQL client
 * 3. Access nested result properties with FULL AUTOMATIC TYPE SAFETY!
 * 
 * NO MANUAL TYPE DEFINITIONS NEEDED - TypeScript infers everything!
 */
import { createQueryBuilder } from '../../src/index.js';
import { schema } from '../schema/index.js';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import type { QueryFields } from '../schema/generated/field-types.js';

const builder = createQueryBuilder<QueryFields>(schema);

// Build a query with object-based selections
// NEW: Returns an object instead of array!
export const query = builder.query(q => ({
  user: q.user({ id: '123' }, user => ({
    id: user.id,
    name: user.name,
    email: user.email
  }))
}));

// Debug: Check what types we're actually getting
type DebugQueryType = typeof query;
type DebugExtracted = typeof query extends TypedDocumentNode<infer TResult, any> ? TResult : 'failed-to-infer';

// Extract the result type automatically!
// TypeScript now knows the exact shape based on selections
type QueryResult = typeof query extends TypedDocumentNode<infer TResult, any> ? TResult : never;

// Explicit type for debugging
type ExpectedResult = {
  user: {
    id: string;
    name: string;
    email: string | null;
  };
};

/**
 * Mock GraphQL client that simulates graphql-request behavior
 * Uses the same signature as graphql-request for proper type inference
 */
class MockGraphQLClient {
  async request<TResult = any, TVariables = Record<string, unknown>>(
    document: TypedDocumentNode<TResult, TVariables>,
    variables?: TVariables
  ): Promise<TResult> {
    // Simulate GraphQL response
    // In real usage, this would make an actual HTTP request
    const varsAny = variables as any;
    const mockData = {
      user: {
        id: varsAny?.id || '123',
        name: 'John Doe',
        email: 'john@example.com'
      }
    };
    
    return mockData as TResult;
  }
}

/**
 * Complete end-to-end test showing AUTOMATIC TYPE INFERENCE!
 * NO explicit types needed - TypeScript infers everything!
 */
export async function testCompleteFlow() {
  // Create mock client (in real app, this would be new GraphQLClient(...))
  const client = new MockGraphQLClient();
  
  // Execute query - result type is AUTOMATICALLY INFERRED! 🎉
  // No need for <UserQueryResult> - TypeScript knows the type from the query!
  const result = await client.request(query, { id: '123' });
  
  // TypeScript automatically knows:
  // - result.user exists (but is nullable per schema)
  // - result.user.id is string
  // - result.user.name is string  
  // - result.user.email is string | null (nullable in schema)
  const user = result.user!;  // Non-null assertion (mock always returns data)
  const userId: string = user.id;
  const userName: string = user.name;
  const userEmail: string | null = user.email;
  
  return { userId, userName, userEmail };
}

/**
 * Test with inline query definition
 * Type inference still works perfectly!
 */
export async function testInlineTyping() {
  const client = new MockGraphQLClient();
  
  const inlineQuery = builder.query(q => ({
    user: q.user({ id: '456' }, user => ({
      id: user.id,
      name: user.name
      // Note: email not selected, so result won't have it!
    }))
  }));
  
  const result = await client.request(inlineQuery, { id: '456' });
  
  // TypeScript knows result.user.email doesn't exist (not selected)!
  const user = result.user!;  // Non-null assertion
  return {
    id: user.id,
    name: user.name
    // email: user.email // ❌ Would be a TypeScript error!
  };
}

