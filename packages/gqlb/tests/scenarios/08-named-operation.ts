/**
 * Named query operation - FULLY TYPED with AUTO-INFERENCE!
 */
import { createQueryBuilder } from '../../src/index.js';
import { $$ } from '../../src/variables.js';
import { schema } from '../schema/index.js';
import type { QueryFields } from '../schema/generated/field-types.js';

const builder = createQueryBuilder<QueryFields>(schema);

const userId = $$<string>('userId');

export const query = builder.query('GetUserById', q => ({
  user: q.user({ id: userId }, user => ({
    id: user.id,
    name: user.name,
    email: user.email
  }))
}));
