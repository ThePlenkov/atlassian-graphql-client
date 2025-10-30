/**
 * Query with nullable fields - FULLY TYPED, NO any!
 */
import { createTypedBuilder } from '../../src/create-typed-builder.js';
import { schema } from '../schema/index.js';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import type { QueryFields } from '../schema/generated/field-types.js';

const builder = createTypedBuilder<QueryFields>(schema);

export const query: TypedDocumentNode = builder.query(q => [
  q.post({ id: '456' }, post => [
    post.id,
    post.title,
    post.author(author => [
      author.id,
      author.name,
      author.email,
      author.profile(profile => [
        profile.bio,
        profile.avatar
      ])
    ])
  ])
]);
