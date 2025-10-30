/**
 * Query with nested filter arguments - FULLY TYPED, NO any!
 */
import { createQueryBuilder } from '../../src/index.js';
import { schema } from '../schema/index.js';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import type { QueryFields } from '../schema/generated/field-types.js';

const builder = createQueryBuilder<QueryFields>(schema);

export const query: TypedDocumentNode = builder.query(q => [
  q.searchUsers({
    filter: {
      name: {
        contains: 'John'
      },
      age: {
        gte: 18,
        lt: 65
      }
    }
  }, user => [
    user.id,
    user.name,
    user.age,
    user.role
  ])
]);
