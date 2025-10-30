/**
 * Query with array fields
 */
import { createQueryBuilder } from '../../src/index.js';
import { schema } from '../schema/index.js';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';

const builder = createQueryBuilder(schema);

export const query: TypedDocumentNode = builder.query((q: any) => [
  q.users({ limit: 10 }, (user: any) => [
    user.id,
    user.name,
    user.posts((post: any) => [
      post.id,
      post.title,
      post.tags
    ])
  ])
]);

