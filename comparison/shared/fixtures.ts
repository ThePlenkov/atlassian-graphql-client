/**
 * Shared test fixtures and scenarios
 * 
 * These represent common query patterns you'd use in a real application.
 * Try implementing these in both approaches to compare IDE experience!
 */

export interface TestScenario {
  name: string;
  description: string;
  variables?: Record<string, any>;
}

/**
 * Test Scenario 1: Get a single user by ID
 * 
 * Requirements:
 * - Query user by ID
 * - Select: id, username, email, name, bio, avatar
 */
export const getUserScenario: TestScenario = {
  name: 'Get User',
  description: 'Fetch a single user with basic fields',
  variables: {
    userId: 'user-123'
  }
};

/**
 * Test Scenario 2: Get user with their posts (paginated)
 * 
 * Requirements:
 * - Query user by ID
 * - Select user: id, username, name
 * - Select posts with pagination (first: 10, after: cursor)
 * - For each post: id, title, excerpt, status, createdAt
 * - Include pageInfo: hasNextPage, endCursor
 */
export const getUserWithPostsScenario: TestScenario = {
  name: 'Get User With Posts',
  description: 'Fetch user with paginated posts',
  variables: {
    userId: 'user-123',
    first: 10,
    after: null
  }
};

/**
 * Test Scenario 3: Search posts with full details
 * 
 * Requirements:
 * - Use search query with filters
 * - Select posts: id, title, content, excerpt, status, createdAt, updatedAt
 * - Select author: id, username, name, avatar
 * - Select tags: id, name, slug
 * - Select comments count
 */
export const searchPostsScenario: TestScenario = {
  name: 'Search Posts',
  description: 'Full-text search with complex selections',
  variables: {
    query: 'graphql',
    status: 'PUBLISHED',
    first: 20
  }
};

/**
 * Test Scenario 4: Get post with nested comments
 * 
 * Requirements:
 * - Query post by ID
 * - Select post: id, title, content, createdAt
 * - Select author: id, username, name, avatar
 * - Select comments (paginated, first: 5)
 * - For each comment: id, content, createdAt
 * - For each comment author: id, username, avatar
 * - Select comment replies (nested, first: 3)
 */
export const getPostWithCommentsScenario: TestScenario = {
  name: 'Get Post With Comments',
  description: 'Deeply nested query with comments and replies',
  variables: {
    postId: 'post-456',
    commentsFirst: 5,
    repliesFirst: 3
  }
};

/**
 * Test Scenario 5: Get user's social graph
 * 
 * Requirements:
 * - Query user by ID
 * - Select user: id, username, name, bio
 * - Select followers (first: 10): id, username, avatar, followersCount
 * - Select following (first: 10): id, username, avatar, followersCount
 * - Include page info for both connections
 */
export const getUserSocialGraphScenario: TestScenario = {
  name: 'Get User Social Graph',
  description: 'Complex query with multiple connections',
  variables: {
    userId: 'user-123',
    first: 10
  }
};

/**
 * Test Scenario 6: Create a new post (Mutation)
 * 
 * Requirements:
 * - Mutation: createPost
 * - Input: { title, content, excerpt, status, tagIds }
 * - Select result post: id, title, status, createdAt
 * - Select errors if any: message, field, code
 */
export const createPostScenario: TestScenario = {
  name: 'Create Post',
  description: 'Mutation with input and error handling',
  variables: {
    input: {
      title: 'My New Post',
      content: 'This is the content...',
      excerpt: 'This is the excerpt...',
      status: 'DRAFT',
      tagIds: ['tag-1', 'tag-2']
    }
  }
};

/**
 * Test Scenario 7: Update user profile (Mutation)
 * 
 * Requirements:
 * - Mutation: updateUser
 * - Input: { id, name, bio, avatar }
 * - Select result user: id, username, name, bio, avatar, updatedAt
 * - Select errors if any: message, field, code
 */
export const updateUserScenario: TestScenario = {
  name: 'Update User',
  description: 'Mutation with partial input',
  variables: {
    input: {
      id: 'user-123',
      name: 'John Doe',
      bio: 'GraphQL enthusiast',
      avatar: 'https://example.com/avatar.jpg'
    }
  }
};

/**
 * Test Scenario 8: Complex search with unions
 * 
 * Requirements:
 * - Use search query (returns SearchResult union)
 * - Handle union types: User, Post, Comment
 * - For User: id, username, name, followersCount
 * - For Post: id, title, excerpt, author { username }
 * - For Comment: id, content, author { username }
 */
export const searchWithUnionsScenario: TestScenario = {
  name: 'Search With Unions',
  description: 'Query returning union types',
  variables: {
    query: 'typescript',
    first: 20
  }
};

/**
 * All test scenarios
 */
export const allScenarios = [
  getUserScenario,
  getUserWithPostsScenario,
  searchPostsScenario,
  getPostWithCommentsScenario,
  getUserSocialGraphScenario,
  createPostScenario,
  updateUserScenario,
  searchWithUnionsScenario
];

/**
 * Mock variables for testing
 */
export const mockVariables = {
  userId: 'user-123',
  postId: 'post-456',
  commentId: 'comment-789',
  first: 10,
  after: null,
  query: 'graphql'
};

