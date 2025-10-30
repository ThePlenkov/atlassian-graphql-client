/**
 * Query with nullable fields and nullable return type
 */
import { createQueryBuilder } from '../../src/index.js';
import { schema } from '../schema/index.js';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';

const builder = createQueryBuilder(schema);

export const query: TypedDocumentNode = builder.query((q: any) => [
  q.post({ id: '456' }, (post: any) => [
    post.id,
    post.title,
    post.author((author: any) => [
      author.id,
      author.name,
      author.email,
      author.profile((profile: any) => [
        profile.bio,
        profile.avatar
      ])
    ])
  ])
]);

