/**
 * Demo showing how the recursive proxy works in practice
 */

import { buildSchema } from 'graphql';
import { createQueryBuilder, $$ } from '../src/index';
import { print } from 'graphql';

// Create a simple nested schema
const schema = buildSchema(`
  type Query {
    user(id: ID!): User
  }

  type User {
    id: ID!
    name: String!
    profile: Profile!
    posts(limit: Int): [Post!]!
  }

  type Profile {
    bio: String!
    avatar: Image!
  }

  type Image {
    url: String!
    width: Int!
    height: Int!
  }

  type Post {
    id: ID!
    title: String!
    author: User!
    comments(first: Int): [Comment!]!
  }

  type Comment {
    id: ID!
    text: String!
    author: User!
  }
`);

const builder = createQueryBuilder(schema);

console.log('🔄 Recursive Proxy Demo\n');
console.log('=' .repeat(70));

// Example 1: Simple query (1 level of recursion)
console.log('\n📊 Example 1: Simple Query (1 level deep)');
console.log('-'.repeat(70));

const userId = $$<string>('userId');
const query1 = builder.query(q => [
  q.user({ id: userId }, user => [
    user.id(),
    user.name()
  ])
]);

console.log(print(query1));

// Example 2: Nested query (2 levels)
console.log('\n📊 Example 2: Nested Query (2 levels deep)');
console.log('-'.repeat(70));

const query2 = builder.query(q => [
  q.user({ id: userId }, user => [
    user.id(),
    user.name(),
    user.profile(profile => [        // ← 1st recursion: User → Profile
      profile.bio()
    ])
  ])
]);

console.log(print(query2));

// Example 3: Deeply nested (3 levels)
console.log('\n📊 Example 3: Deep Nesting (3 levels deep)');
console.log('-'.repeat(70));

const query3 = builder.query(q => [
  q.user({ id: userId }, user => [
    user.id(),
    user.name(),
    user.profile(profile => [        // ← 1st recursion: User → Profile
      profile.bio(),
      profile.avatar(avatar => [     // ← 2nd recursion: Profile → Image
        avatar.url(),
        avatar.width(),
        avatar.height()
      ])
    ])
  ])
]);

console.log(print(query3));

// Example 4: Very deeply nested with multiple branches (4+ levels)
console.log('\n📊 Example 4: Complex Deep Nesting (4+ levels, multiple branches)');
console.log('-'.repeat(70));

const query4 = builder.query(q => [
  q.user({ id: userId }, user => [
    user.id(),
    user.name(),
    user.profile(profile => [        // ← 1st recursion: User → Profile
      profile.bio(),
      profile.avatar(avatar => [     // ← 2nd recursion: Profile → Image
        avatar.url()
      ])
    ]),
    user.posts({ limit: 5 }, post => [  // ← Another 1st level recursion: User → Post
      post.id(),
      post.title(),
      post.author(author => [        // ← 2nd recursion: Post → User (circular!)
        author.id(),
        author.name()
      ]),
      post.comments({ first: 3 }, comment => [  // ← 2nd recursion: Post → Comment
        comment.id(),
        comment.text(),
        comment.author(author => [   // ← 3rd recursion: Comment → User
          author.id(),
          author.name(),
          author.profile(profile => [  // ← 4th recursion: User → Profile
            profile.bio()
          ])
        ])
      ])
    ])
  ])
]);

console.log(print(query4));

console.log('\n' + '='.repeat(70));
console.log('✅ All queries built successfully using recursive proxies!');
console.log('\nKey Points:');
console.log('  1. Each time you access a field that returns an object type,');
console.log('     a NEW proxy is created recursively');
console.log('  2. The proxy looks up fields in the schema dynamically');
console.log('  3. This works for ANY depth and ANY schema');
console.log('  4. Zero code generation needed!');
console.log('='.repeat(70) + '\n');

