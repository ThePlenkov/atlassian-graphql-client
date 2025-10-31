/**
 * Multiple root fields - FULLY TYPED with AUTO-INFERENCE!
 */
import { createQueryBuilder } from '../../src/index.js';
import { $ } from '../../src/variables.js';
import { schema } from '../schema/index.js';
import type { QueryFields } from '../schema/generated/field-types.js';

const builder = createQueryBuilder<QueryFields>(schema);

const limit = $<number>('limit');
const searchQuery = $<string>('searchQuery');

export const query = builder.query(q => ({
  hello: q.hello,
  users: q.users({ limit }, user => ({
    id: user.id,
    name: user.name
  })),
  search: q.search({ query: searchQuery }, result => ({
    totalCount: result.totalCount
  }))
}));
