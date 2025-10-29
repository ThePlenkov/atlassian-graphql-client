/**
 * Basic usage example of gqlb
 */

import { buildSchema } from 'graphql';
import { createQueryBuilder, $, $$ } from '../src';

// Example schema
const schema = buildSchema(`
  type Query {
    user(id: ID!): User
    users(limit: Int, offset: Int): [User!]!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    posts(first: Int): [Post!]!
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
  }
`);

// Create query builder
const builder = createQueryBuilder(schema);

// Example 1: Simple query with variables
const userIdVar = $$<string>('userId');
const query1 = builder.query(q => [
  q.user({ id: userIdVar }, user => [
    user.id,
    user.name,
    user.email,
  ])
]);

console.log('Query 1:', query1.loc?.source.body);

// Example 2: Query with nested selections
const query2 = builder.query(q => [
  q.user({ id: '123' }, user => [
    user.id,
    user.name,
    user.posts({ first: 10 }, posts => [
      posts.id,
      posts.title,
      posts.content,
    ])
  ])
]);

console.log('Query 2:', query2.loc?.source.body);

// Example 3: Query with multiple root fields
const limitVar = $<number>('limit');
const offsetVar = $<number>('offset');

const query3 = builder.query(q => [
  q.users({ limit: limitVar, offset: offsetVar }, user => [
    user.id,
    user.name,
  ])
]);

console.log('Query 3:', query3.loc?.source.body);

