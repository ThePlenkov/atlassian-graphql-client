/**
 * Query with arrays - FULLY TYPED, NO any!
 */
import { createTypedBuilder } from '../../src/create-typed-builder.js';
import { schema } from '../schema/index.js';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import type { QueryFields } from '../schema/generated/field-types.js';

const builder = createTypedBuilder<QueryFields>(schema);

export const query: TypedDocumentNode = builder.query(q => [
  q.users({ limit: 10 }, user => [
    user.id,
    user.name,
    user.posts(post => [
      post.id,
      post.title,
      post.tags
    ])
  ])
]);
