/**
 * Query with inline arguments - Testing ARRAY syntax!
 */
import { createQueryBuilder } from '../../src/index.js';
import { schema } from '../schema/index.js';
import type { QueryFields } from '../schema/generated/field-types.js';

const builder = createQueryBuilder<QueryFields>(schema);

export const query = builder.query(q => [
  q.user({ id: '123' }, user => [
    user.id,
    user.name,
    user.email
  ])
]);
