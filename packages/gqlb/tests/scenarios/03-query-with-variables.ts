/**
 * Query with variables - FULLY TYPED, NO any!
 */
import { createQueryBuilder } from '../../src/index.js';
import { $$, $ } from '../../src/variables.js';
import { schema } from '../schema/index.js';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import type { QueryFields } from '../schema/generated/field-types.js';

const builder = createQueryBuilder<QueryFields>(schema);

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
