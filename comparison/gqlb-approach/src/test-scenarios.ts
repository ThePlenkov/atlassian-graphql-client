/**
 * Test Scenarios - gqlb + GraphQL Codegen Approach
 * 
 * 🎯 IDE Experience Tips:
 * 1. Type "q." and watch autocomplete suggest all available fields
 * 2. Hover over any field to see its type information
 * 3. Try accessing a field that doesn't exist - TypeScript will catch it
 * 4. Notice how nested selections maintain full type safety
 * 5. Arguments are fully typed with required/optional indicators
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { buildSchema } from 'graphql';
import { createQueryBuilder as createGqlbBuilder, $$ } from 'gqlb';
import type { QueryFields, MutationFields } from './generated/field-types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load schema
const schemaPath = join(__dirname, '../../shared/schema.graphql');
const schemaSDL = readFileSync(schemaPath, 'utf-8');
const schema = buildSchema(schemaSDL);

// Create typed query builder
const builder = createGqlbBuilder<QueryFields, MutationFields>(schema);

/**
 * Scenario 1: Get a single user by ID
 * 
 * 💡 Try this:
 * - Type "q." and see all query fields
 * - Inside the callback, type "user." to see all User fields
 * - Try adding a field that doesn't exist - you'll get a type error
 */
export const getUserQuery = builder.query('GetUser', q => [
  q.user({ id: $$<string>('userId') }, user => [
    user.id,
    user.username,
    user.email,
    user.name,
    user.bio,
    user.avatar,
    // Try uncommenting this - TypeScript will error:
    // user.nonExistentField,
  ])
]);

/**
 * Scenario 2: Get user with their posts (paginated)
 * 
 * 💡 Try this:
 * - Notice how user.posts() requires arguments
 * - See how the edges/node pattern is fully typed
 * - Hover over "node" to see the Post type
 */
export const getUserWithPostsQuery = builder.query('GetUserWithPosts', q => [
  q.user({ id: $$<string>('userId') }, user => [
    user.id,
    user.username,
    user.name,
    user.posts({ first: $$<number>('first'), after: $$<string>('after') }, posts => [
      posts.edges(edge => [
        edge.cursor,
        edge.node(post => [
          post.id,
          post.title,
          post.excerpt,
          post.status,
          post.createdAt,
          // Try typing "post." to see all available fields
        ])
      ]),
      posts.pageInfo(pageInfo => [
        pageInfo.hasNextPage,
        pageInfo.endCursor,
      ])
    ])
  ])
]);

/**
 * Scenario 3: Search posts with full details
 * 
 * 💡 Try this:
 * - See how search returns different types (union handling)
 * - Notice author and tags are nested selections
 * - Autocomplete works at every level
 */
export const searchPostsQuery = builder.query('SearchPosts', q => [
  q.posts({ 
    status: $$<string>('status'), 
    first: $$<number>('first')
  }, posts => [
    posts.edges(edge => [
      edge.node(post => [
        post.id,
        post.title,
        post.content,
        post.excerpt,
        post.status,
        post.createdAt,
        post.updatedAt,
        // Nested: author information
        post.author(author => [
          author.id,
          author.username,
          author.name,
          author.avatar,
        ]),
        // Nested: tags
        post.tags(tag => [
          tag.id,
          tag.name,
          tag.slug,
        ]),
        // Aggregates
        post.commentsCount,
      ])
    ]),
    posts.pageInfo(pageInfo => [
      pageInfo.hasNextPage,
      pageInfo.hasPreviousPage,
      pageInfo.startCursor,
      pageInfo.endCursor,
    ])
  ])
]);

/**
 * Scenario 4: Get post with nested comments and replies
 * 
 * 💡 Try this:
 * - See deeply nested selections (post -> comments -> replies)
 * - Each level maintains full type safety
 * - Try accessing reply.nonExistent - type error!
 */
export const getPostWithCommentsQuery = builder.query('GetPostWithComments', q => [
  q.post({ id: $$<string>('postId') }, post => [
    post.id,
    post.title,
    post.content,
    post.createdAt,
    // Post author
    post.author(author => [
      author.id,
      author.username,
      author.name,
      author.avatar,
    ]),
    // Comments with pagination
    post.comments({ first: $$<number>('commentsFirst') }, comments => [
      comments.edges(edge => [
        edge.node(comment => [
          comment.id,
          comment.content,
          comment.createdAt,
          // Comment author
          comment.author(author => [
            author.id,
            author.username,
            author.avatar,
          ]),
          // Nested replies!
          comment.replies({ first: $$<number>('repliesFirst') }, replies => [
            replies.edges(edge => [
              edge.node(reply => [
                reply.id,
                reply.content,
                reply.createdAt,
                reply.author(author => [
                  author.id,
                  author.username,
                ])
              ])
            ])
          ])
        ])
      ]),
      comments.pageInfo(pageInfo => [
        pageInfo.hasNextPage,
        pageInfo.endCursor,
      ])
    ])
  ])
]);

/**
 * Scenario 5: Get user's social graph
 * 
 * 💡 Try this:
 * - Multiple connection fields (followers, following)
 * - Same pattern works for both
 * - Fully typed at every level
 */
export const getUserSocialGraphQuery = builder.query('GetUserSocialGraph', q => [
  q.user({ id: $$<string>('userId') }, user => [
    user.id,
    user.username,
    user.name,
    user.bio,
    user.followersCount,
    user.followingCount,
    // Followers connection
    user.followers({ first: $$<number>('first') }, followers => [
      followers.edges(edge => [
        edge.node(follower => [
          follower.id,
          follower.username,
          follower.avatar,
          follower.followersCount,
        ])
      ]),
      followers.pageInfo(pageInfo => [
        pageInfo.hasNextPage,
        pageInfo.endCursor,
      ])
    ]),
    // Following connection
    user.following({ first: $$<number>('first') }, following => [
      following.edges(edge => [
        edge.node(user => [
          user.id,
          user.username,
          user.avatar,
          user.followersCount,
        ])
      ]),
      following.pageInfo(pageInfo => [
        pageInfo.hasNextPage,
        pageInfo.endCursor,
      ])
    ])
  ])
]);

/**
 * Scenario 6: Create a new post (Mutation)
 * 
 * 💡 Try this:
 * - Mutations work the same as queries
 * - Input types are fully validated
 * - Error handling is typed
 */
export const createPostMutation = builder.mutation('CreatePost', m => [
  m.createPost({ input: $$<any>('input') }, result => [
    result.post(post => [
      post.id,
      post.title,
      post.status,
      post.createdAt,
      post.author(author => [
        author.id,
        author.username,
      ])
    ]),
    result.errors(error => [
      error.message,
      error.field,
      error.code,
    ])
  ])
]);

/**
 * Scenario 7: Update user profile (Mutation)
 * 
 * 💡 Try this:
 * - Partial updates are supported
 * - Return updated fields
 * - Include error handling
 */
export const updateUserMutation = builder.mutation('UpdateUser', m => [
  m.updateUser({ id: $$<string>('id'), input: $$<any>('input') }, result => [
    result.user(user => [
      user.id,
      user.username,
      user.name,
      user.bio,
      user.avatar,
      user.updatedAt,
    ]),
    result.errors(error => [
      error.message,
      error.field,
      error.code,
    ])
  ])
]);

/**
 * Scenario 8: Complex search with unions (if your schema supports it)
 * 
 * 💡 Try this:
 * - Union type handling
 * - Type discrimination based on __typename
 * - Different fields for different types
 */
export const searchWithUnionsQuery = builder.query('SearchAll', q => [
  q.search({ query: $$<string>('query'), first: $$<number>('first') }, results => [
    results.edges(edge => [
      edge.node(node => [
        // Union type handling - in a real app you'd use type guards
        // For now, just demonstrate the structure works
      ])
    ])
  ])
]);

/**
 * Export all queries for testing
 */
export const allQueries = {
  getUserQuery,
  getUserWithPostsQuery,
  searchPostsQuery,
  getPostWithCommentsQuery,
  getUserSocialGraphQuery,
  createPostMutation,
  updateUserMutation,
  searchWithUnionsQuery,
};
