/**
 * gqlb + GraphQL Codegen Approach
 * 
 * This demonstrates building queries with:
 * - GraphQL Codegen for type generation
 * - gqlb-codegen/field-types for FieldFn types
 * - gqlb runtime for proxy-based query building
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { buildSchema } from 'graphql';
import { createQueryBuilder as createGqlbBuilder, $$ } from 'gqlb';
import type { QueryBuilder } from 'gqlb';
import type { QueryFields, MutationFields } from './generated/field-types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load schema
const schemaPath = join(__dirname, '../../shared/schema.graphql');
const schemaSDL = readFileSync(schemaPath, 'utf-8');
const schema = buildSchema(schemaSDL);

// Create typed query builder
export function createQueryBuilder(): QueryBuilder<QueryFields, MutationFields> {
  return createGqlbBuilder<QueryFields, MutationFields>(schema);
}

// Re-export utilities
export { $$, $ } from 'gqlb';
export type * from './generated/schema-types.js';

// Example usage
export function exampleQueries() {
  const builder = createQueryBuilder();
  
  // Example 1: Simple query
  const userId = $$<string>('userId');
  const simpleQuery = builder.query('GetUser', q => [
    q.user({ id: userId }, user => [
      user.id,
      user.username,
      user.email,
      user.name
    ])
  ]);
  
  // Example 2: Nested query with pagination
  const first = $$<number>('first');
  const after = $$<string>('after');
  const nestedQuery = builder.query('GetUserWithPosts', q => [
    q.user({ id: userId }, user => [
      user.id,
      user.username,
      user.name,
      user.posts({ first, after }, posts => [
        posts.edges(edge => [
          edge.cursor,
          edge.node(post => [
            post.id,
            post.title,
            post.excerpt,
            post.status,
            post.createdAt
          ])
        ]),
        posts.pageInfo(pageInfo => [
          pageInfo.hasNextPage,
          pageInfo.endCursor
        ])
      ])
    ])
  ]);
  
  // Example 3: Mutation
  const createUserInput = $$<any>('input');
  const mutation = builder.mutation('CreateUser', m => [
    m.createUser({ input: createUserInput }, payload => [
      payload.user(user => [
        user.id,
        user.username,
        user.email
      ]),
      payload.errors(error => [
        error.message,
        error.field,
        error.code
      ])
    ])
  ]);
  
  return { simpleQuery, nestedQuery, mutation };
}

