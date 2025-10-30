/**
 * Query with nested filter arguments
 */
import { createQueryBuilder } from '../../src/index.js';
import { schema } from '../schema/index.js';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';

const builder = createQueryBuilder(schema);

export const query: TypedDocumentNode = builder.query((q: any) => [
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
  }, (user: any) => [
    user.id,
    user.name,
    user.age,
    user.role
  ])
]);

