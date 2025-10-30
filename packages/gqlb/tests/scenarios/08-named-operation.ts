/**
 * Named query operation - FULLY TYPED, NO any!
 */
import { createQueryBuilder } from '../../src/index.js';
import { $$ } from '../../src/variables.js';
import { schema } from '../schema/index.js';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import type { QueryFields } from '../schema/generated/field-types.js';

const builder = createQueryBuilder<QueryFields>(schema);

const userId = $$<string>('userId');

export const query: TypedDocumentNode = builder.query('GetUserById', q => [
  q.user({ id: userId }, user => [
    user.id,
    user.name,
    user.email
  ])
]);
