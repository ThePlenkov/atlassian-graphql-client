/**
 * Named query operation
 */
import { createQueryBuilder, $$ } from '../../src/index.js';
import { schema } from '../schema/index.js';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';

const builder = createQueryBuilder(schema);

const userId = $$<string>('userId');

export const query: TypedDocumentNode = builder.query('GetUserById', (q: any) => [
  q.user({ id: userId }, (user: any) => [
    user.id,
    user.name,
    user.email
  ])
]);

