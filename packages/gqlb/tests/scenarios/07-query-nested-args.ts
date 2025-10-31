/**
 * Query with nested filter arguments - FULLY TYPED with AUTO-INFERENCE!
 */
import { createQueryBuilder } from '../../src/index.js';
import { schema } from '../schema/index.js';
import type { QueryFields } from '../schema/generated/field-types.js';

const builder = createQueryBuilder<QueryFields>(schema);

export const query = builder.query(q => ({
  searchUsers: q.searchUsers({
    filter: {
      name: {
        contains: 'John'
      },
      age: {
        gte: 18,
        lt: 65
      }
    }
  }, user => ({
    id: user.id,
    name: user.name,
    age: user.age,
    role: user.role
  }))
}));
