/**
 * Query with variables - both required ($$) and optional ($)
 */
import { createQueryBuilder, $$, $ } from '../../src/index.js';
import { schema } from '../schema/index.js';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';

const builder = createQueryBuilder(schema);

const userId = $$<string>('userId');
const limit = $<number>('limit');

export const query: TypedDocumentNode = builder.query((q: any) => [
  q.user({ id: userId }, (user: any) => [
    user.id,
    user.name,
    user.posts({ limit }, (post: any) => [
      post.id,
      post.title
    ])
  ])
]);

