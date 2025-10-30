/**
 * Simple mutation - FULLY TYPED, NO any!
 */
import { createTypedBuilder } from '../../src_typed/create-typed-builder.js';
import { schema } from '../schema/index.js';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import type { QueryFields, MutationFields } from '../schema/generated/field-types.js';

const builder = createTypedBuilder<QueryFields, MutationFields>(schema);

export const mutation: TypedDocumentNode = builder.mutation(m => [
  m.deleteUser({ id: '123' })
]);
