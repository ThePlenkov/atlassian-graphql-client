/**
 * Multiple root fields - FULLY TYPED, NO any!
 */
import { createTypedBuilder } from '../../src/create-typed-builder.js';
import { $ } from '../../src/typed-builder.js';
import { schema } from '../schema/index.js';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import type { QueryFields } from '../schema/generated/field-types.js';

const builder = createTypedBuilder<QueryFields>(schema);

const limit = $<number>('limit');
const searchQuery = $<string>('searchQuery');

export const query: TypedDocumentNode = builder.query(q => [
  q.hello,
  q.users({ limit }, user => [
    user.id,
    user.name
  ]),
  q.search({ query: searchQuery }, result => [
    result.totalCount
  ])
]);
