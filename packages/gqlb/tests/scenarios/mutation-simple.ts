/**
 * Simple mutation with scalar return
 */
import { createQueryBuilder } from '../../src/index.js';
import { schema } from '../schema/index.js';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';

const builder = createQueryBuilder(schema);

export const mutation: TypedDocumentNode = builder.mutation(m => [
  m.deleteUser({ id: '123' })
]);

