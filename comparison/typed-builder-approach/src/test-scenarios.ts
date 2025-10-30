/**
 * Test Scenarios - typed-graphql-builder Approach
 * 
 * 🎯 IDE Experience Tips:
 * 1. Type "q." and watch autocomplete suggest all root query fields
 * 2. Inside callbacks, type the parameter name + "." for field suggestions
 * 3. Hover over any field to see its type information
 * 4. Try accessing a field that doesn't exist - TypeScript will catch it
 * 5. Notice the selector array pattern vs object-based selection
 */

import { query, mutation, $ } from './generated/builder.js';

/**
 * Scenario 1: Get a single user by ID
 * 
 * 💡 Try this:
 * - Type "q." to see all query fields
 * - Inside the user callback, type "user." to see all User fields
 * - Try adding a field that doesn't exist - you'll get a type error
 */
export const getUserQuery = query('GetUser', q => [
  q.user({ id: $('userId') }, user => [
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
 * - Notice the nested callback structure
 * - See how posts.edges() takes a callback
 * - Each level provides autocomplete
 */
export const getUserWithPostsQuery = query('GetUserWithPosts', q => [
  q.user({ id: $('userId') }, user => [
    user.id,
    user.username,
    user.name,
    user.posts({ first: $('first'), after: $('after') }, posts => [
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
 * - Multiple nested selections
 * - Notice author() and tags() callbacks
 * - Each provides full autocomplete
 */
export const searchPostsQuery = query('SearchPosts', q => [
  q.posts({ 
    status: $('status'), 
    first: $('first')
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
 * - Deeply nested structure (post -> comments -> replies)
 * - Each callback provides type safety
 * - Try accessing a non-existent field at any level
 */
export const getPostWithCommentsQuery = query('GetPostWithComments', q => [
  q.post({ id: $('postId') }, post => [
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
    post.comments({ first: $('commentsFirst') }, comments => [
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
          comment.replies({ first: $('repliesFirst') }, replies => [
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
 * - Same callback pattern for both
 * - Fully typed at every level
 */
export const getUserSocialGraphQuery = query('GetUserSocialGraph', q => [
  q.user({ id: $('userId') }, user => [
    user.id,
    user.username,
    user.name,
    user.bio,
    user.followersCount,
    user.followingCount,
    // Followers connection
    user.followers({ first: $('first') }, followers => [
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
    user.following({ first: $('first') }, following => [
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
 * - Use mutation() instead of query()
 * - Input validation is typed
 * - Error handling is built-in
 */
export const createPostMutation = mutation('CreatePost', m => [
  m.createPost({ input: $('input') }, result => [
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
 * - Partial updates supported
 * - Return updated fields
 * - Error handling included
 */
export const updateUserMutation = mutation('UpdateUser', m => [
  m.updateUser({ id: $('id'), input: $('input') }, result => [
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
 * - Union type handling with callbacks
 * - Type discrimination with __typename
 * - Different fields for different types
 */
export const searchWithUnionsQuery = query('SearchAll', q => [
  q.search({ query: $('query'), first: $('first') }, results => [
    results.edges(edge => [
      edge.node(node => [
        // Union type handling - in a real app you'd use on_User, on_Post, etc.
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

