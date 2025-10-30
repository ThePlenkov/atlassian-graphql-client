/**
 * Query with variables - FULLY TYPED, NO any!
 */
import { createTypedBuilder } from '../../src/create-typed-builder.js';
import { $$, $ } from '../../src/typed-builder.js';
import { schema } from '../schema/index.js';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import type { QueryFields } from '../schema/generated/field-types.js';

const builder = createTypedBuilder<QueryFields>(schema);

const userId = $$<string>('userId');
const limit = $<number>('limit');

export const query: TypedDocumentNode = builder.query(q => [
  q.user({ id: userId }, user => [
    user.id,
    user.name,
    user.posts({ limit }, post => [
      post.id,
      post.title
    ])
  ])
]);
