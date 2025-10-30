/**
 * Query with multiple root fields
 */
import { createQueryBuilder, $ } from '../../src/index.js';
import { schema } from '../schema/index.js';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';

const builder = createQueryBuilder(schema);

const limit = $<number>('limit');
const searchQuery = $<string>('searchQuery');

export const query: TypedDocumentNode = builder.query((q: any) => [
  q.hello,
  q.users({ limit }, (user: any) => [
    user.id,
    user.name
  ]),
  q.search({ query: searchQuery }, (result: any) => [
    result.totalCount
  ])
]);

