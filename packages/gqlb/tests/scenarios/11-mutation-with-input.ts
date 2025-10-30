/**
 * Mutation with complex nested input - FULLY TYPED, NO any!
 */
import { createQueryBuilder } from '../../src/index.js';
import { $$ } from '../../src/variables.js';
import { schema } from '../schema/index.js';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import type { QueryFields, MutationFields } from '../schema/generated/field-types.js';
import type { CreateUserInput } from '../schema/generated/schema-types.js';

const builder = createQueryBuilder<QueryFields, MutationFields>(schema);

const input = $$<CreateUserInput>('input');

export const mutation: TypedDocumentNode = builder.mutation(m => [
  m.createUser({ input }, user => [
    user.id,
    user.name,
    user.email,
    user.role,
    user.profile(profile => [
      profile.bio,
      profile.location(location => [
        location.city,
        location.country
      ])
    ])
  ])
]);
