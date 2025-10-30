/**
 * Query with arrays - FULLY TYPED with AUTO-INFERENCE!
 */
import { createQueryBuilder } from '../../src/index.js';
import { schema } from '../schema/index.js';
import type { QueryFields } from '../schema/generated/field-types.js';

const builder = createQueryBuilder<QueryFields>(schema);

export const query = builder.query(q => ({
  users: q.users({ limit: 10 }, user => ({
    id: user.id,
    name: user.name,
    posts: user.posts(post => ({
      id: post.id,
      title: post.title,
      tags: post.tags
    }))
  }))
}));
