/**
 * Simple mutation - FULLY TYPED, NO any!
 */
import { createQueryBuilder } from '../../src/index.js';
import { schema } from '../schema/index.js';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import type { QueryFields, MutationFields } from '../schema/generated/field-types.js';

const builder = createQueryBuilder<QueryFields, MutationFields>(schema);

export const mutation: TypedDocumentNode = builder.mutation(m => [
  m.deleteUser({ id: '123' })
]);
