/**
 * Test scenario: Array syntax with AUTOMATIC TYPE INFERENCE! 🎯
 * 
 * This demonstrates:
 * 1. Build a query with ARRAY-based selections
 * 2. Execute it with a mock GraphQL client
 * 3. Access nested result properties with FULL AUTOMATIC TYPE SAFETY!
 * 
 * This proves array syntax works exactly like typed-graphql-builder!
 */
import { createQueryBuilder } from '../../src/index.js';
import { schema } from '../schema/index.js';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import type { QueryFields } from '../schema/generated/field-types.js';

const builder = createQueryBuilder<QueryFields>(schema);

// Build a query with ARRAY-based selections (like typed-graphql-builder!)
export const query = builder.query(q => [
  q.user({ id: '123' }, user => [
    user.id,
    user.name,
    user.email
  ])
]);

// ═══════════════════════════════════════════════════════════════
// PROOF OF AUTOMATIC TYPE INFERENCE FROM ARRAY SELECTIONS
// ═══════════════════════════════════════════════════════════════

// Step 1: Extract the inferred result type from the query
type InferredQueryType = typeof query;
type ExtractedResult = InferredQueryType extends TypedDocumentNode<infer TResult, any> ? TResult : never;

// Step 2: Prove TypeScript knows the EXACT structure (including nullability!)
type ProofOfInference = ExtractedResult extends {
  user: {
    id: string;
    name: string;
    email: string | null;
  } | null;  // user field is nullable in the schema!
} ? '✅ TYPE INFERENCE WORKS!' : '❌ INFERENCE FAILED';

// Step 3: This compiles successfully = PROOF!
const typeInferenceProof: ProofOfInference = '✅ TYPE INFERENCE WORKS!';

// Step 4: Hover over this to see the beautiful inferred type structure!
type InspectInferredType = ExtractedResult;

// Step 5: PROVE fields that WEREN'T selected don't exist in the type
// These checks verify that only selected fields appear in the inferred type
// Extract non-null user type for cleaner checking
type UserType = NonNullable<ExtractedResult['user']>;
type VerifyOnlySelectedFields = {
  hasId: UserType extends { id: any } ? true : false;      // ✅ Should be true
  hasName: UserType extends { name: any } ? true : false;  // ✅ Should be true
  hasEmail: UserType extends { email: any } ? true : false; // ✅ Should be true
  hasAge: UserType extends { age: any } ? true : false;    // ❌ Should be false (not selected!)
  hasPosts: UserType extends { posts: any } ? true : false; // ❌ Should be false (not selected!)
};

// This will ONLY compile if inference is precise (selected fields present, unselected fields absent)
const verifyPrecision: VerifyOnlySelectedFields = {
  hasId: true,
  hasName: true,
  hasEmail: true,
  hasAge: false,   // This proves 'age' is NOT in the type!
  hasPosts: false  // This proves 'posts' is NOT in the type!
};

/**
 * Mock GraphQL client that simulates graphql-request behavior
 * Returns mock data that matches common query patterns
 */
class MockGraphQLClient {
  async request<TResult = any, TVariables = Record<string, unknown>>(
    document: TypedDocumentNode<TResult, TVariables>,
    variables?: TVariables
  ): Promise<TResult> {
    const varsAny = variables as any;
    
    // Simple mock data that covers both single user and users array scenarios
    const mockData = {
      user: {
        id: varsAny?.id || '123',
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        posts: [
          { id: 'p1', title: 'Post 1', content: 'Content 1' }
        ]
      },
      users: [
        {
          id: '1',
          name: 'Alice',
          email: 'alice@example.com',
          age: 25,
          posts: [
            { id: 'p1', title: 'Post 1', content: 'Content 1' },
            { id: 'p2', title: 'Post 2', content: 'Content 2' }
          ]
        },
        {
          id: '2',
          name: 'Bob',
          email: 'bob@example.com',
          age: 35,
          posts: [
            { id: 'p3', title: 'Bob Post 1', content: 'Content 3' }
          ]
        }
      ]
    };
    
    return mockData as TResult;
  }
}

/**
 * Complete end-to-end test with ARRAY syntax
 * Proves automatic type inference works!
 */
export async function testArraySyntaxWithInference() {
  const client = new MockGraphQLClient();
  
  // Execute query - result type is AUTOMATICALLY INFERRED from array selections! 🎉
  const response = await client.request(query, { id: '123' });
  
  // PROOF 1: TypeScript automatically knows these fields exist
  // - response.user exists
  // - response.user.id is string
  // - response.user.name is string  
  // - response.user.email is string | null
  
  // PROOF 2: TypeScript knows user is nullable! (correct per schema)
  // We use non-null assertion since mock always returns data
  const user = response.user!;  // Non-null assertion
  const id: string = user.id;
  const name: string = user.name;
  const email: string | null = user.email;
  
  // PROOF 3: These would be TypeScript ERRORS (uncomment to verify):
  // const age = user.age;  // ❌ Error: Property 'age' does not exist
  // const posts = user.posts;  // ❌ Error: Property 'posts' does not exist
  // const wrongRoot = response.posts;  // ❌ Error: Property 'posts' does not exist on root
  
  // This is the EXACT pattern from typed-graphql-builder docs!
  console.log(user.id);
  console.log(user.name);
  console.log(user.email);
  
  return {
    userId: user.id,
    userName: user.name,
    userEmail: user.email
  };
}

/**
 * Test nested array selections
 */
export async function testNestedArrays() {
  const client = new MockGraphQLClient();
  
  const nestedQuery = builder.query(q => [
    q.users({ limit: 10 }, user => [
      user.id,
      user.name,
      user.posts(post => [
        post.id,
        post.title
      ])
    ])
  ]);
  
  const response = await client.request(nestedQuery);
  
  // NOW using 'response' - TypeScript must know the full nested structure!
  // These lines ONLY compile if type inference works for nested arrays
  const firstUser = response.users[0];  // TypeScript knows this is an array of users!
  const firstPost = firstUser.posts[0];  // And posts is an array too!
  
  // Explicit type assertions to prove TypeScript knows the types
  const userId: string = firstUser.id;
  const userName: string = firstUser.name;
  const postId: string = firstPost.id;
  const postTitle: string = firstPost.title;
  
  // These would be TypeScript ERRORS:
  // const age = firstUser.age;  // ❌ Property 'age' does not exist
  // const email = firstUser.email;  // ❌ Property 'email' does not exist
  // const content = firstPost.content;  // ❌ Property 'content' does not exist
  
  return {
    firstUserId: userId,
    firstUserName: userName,
    firstPostTitle: postTitle
  };
}

