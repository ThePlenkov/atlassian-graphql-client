/**
 * Simple mutation - FULLY TYPED with AUTO-INFERENCE!
 */
import { createQueryBuilder } from '../../src/index.js';
import { schema } from '../schema/index.js';
import type { QueryFields, MutationFields } from '../schema/generated/field-types.js';

const builder = createQueryBuilder<QueryFields, MutationFields>(schema);

export const mutation = builder.mutation(m => ({
  deleteUser: m.deleteUser({ id: '123' })
}));
