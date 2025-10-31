/**
 * Query with nullable fields - FULLY TYPED with AUTO-INFERENCE!
 */
import { createQueryBuilder } from '../../src/index.js';
import { schema } from '../schema/index.js';
import type { QueryFields } from '../schema/generated/field-types.js';

const builder = createQueryBuilder<QueryFields>(schema);

export const query = builder.query(q => ({
  post: q.post({ id: '456' }, post => ({
    id: post.id,
    title: post.title,
    author: post.author(author => ({
      id: author.id,
      name: author.name,
      email: author.email,
      profile: author.profile(profile => ({
        bio: profile.bio,
        avatar: profile.avatar
      }))
    }))
  }))
}));
