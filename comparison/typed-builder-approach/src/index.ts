/**
 * typed-graphql-builder Approach
 * 
 * This demonstrates building queries with:
 * - typed-graphql-builder for full code generation
 */

import { query, mutation, $ } from './generated/builder.js';

// Example usage
export function exampleQueries() {
  // Example 1: Simple query
  const simpleQuery = query('GetUser', q => [
    q.user({ id: $('userId') }, user => [
      user.id,
      user.username,
      user.email,
      user.name
    ])
  ]);
  
  // Example 2: Nested query with pagination
  const nestedQuery = query('GetUserWithPosts', q => [
    q.user({ id: $('userId') }, user => [
      user.id,
      user.username,
      user.name,
      user.posts({ first: $('first'), after: $('after') }, posts => [
        posts.edges(edge => [
          edge.cursor,
          edge.node(node => [
            node.id,
            node.title,
            node.excerpt,
            node.status,
            node.createdAt
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
  const mutationQuery = mutation('CreateUser', m => [
    m.createUser({ input: $('input') }, payload => [
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
  
  return { simpleQuery, nestedQuery, mutation: mutationQuery };
}

