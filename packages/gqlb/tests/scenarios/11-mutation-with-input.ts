/**
 * Mutation with complex nested input - FULLY TYPED with AUTO-INFERENCE!
 */
import { createQueryBuilder } from '../../src/index.js';
import { $$ } from '../../src/variables.js';
import { schema } from '../schema/index.js';
import type { QueryFields, MutationFields } from '../schema/generated/field-types.js';
import type { CreateUserInput } from '../schema/generated/schema-types.js';

const builder = createQueryBuilder<QueryFields, MutationFields>(schema);

const input = $$<CreateUserInput>('input');

export const mutation = builder.mutation(m => ({
  createUser: m.createUser({ input }, user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    profile: user.profile(profile => ({
      bio: profile.bio,
      location: profile.location(location => ({
        city: location.city,
        country: location.country
      }))
    }))
  }))
}));
