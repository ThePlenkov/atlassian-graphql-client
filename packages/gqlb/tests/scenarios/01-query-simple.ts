/**
 * Simple query - Testing ARRAY syntax!
 */
import { createQueryBuilder } from '../../src/index.js';
import { schema } from '../schema/index.js';
import type { QueryFields } from '../schema/generated/field-types.js';

const builder = createQueryBuilder<QueryFields>(schema);

// Array-based selection API (simpler!)
export const query = builder.query(q => [
  q.hello
]);
