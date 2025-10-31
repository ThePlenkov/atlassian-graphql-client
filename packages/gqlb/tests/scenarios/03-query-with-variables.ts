/**
 * Query with variables - FULLY TYPED with AUTO-INFERENCE!
 */
import { createQueryBuilder } from '../../src/index.js';
import { $$, $ } from '../../src/variables.js';
import { schema } from '../schema/index.js';
import type { QueryFields } from '../schema/generated/field-types.js';

const builder = createQueryBuilder<QueryFields>(schema);

const userId = $$<string>('userId');
const limit = $<number>('limit');

export const query = builder.query(q => ({
  user: q.user({ id: userId }, user => ({
    id: user.id,
    name: user.name,
    posts: user.posts({ limit }, post => ({
      id: post.id,
      title: post.title
    }))
  }))
}));
