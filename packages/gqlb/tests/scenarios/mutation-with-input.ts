/**
 * Mutation with complex nested input object
 */
import { createQueryBuilder, $$ } from '../../src/index.js';
import { schema } from '../schema/index.js';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import type { CreateUserInput } from '../schema/generated/schema-types.js';

const builder = createQueryBuilder(schema);

const input = $$<CreateUserInput>('input');

export const mutation: TypedDocumentNode = builder.mutation((m: any) => [
  m.createUser({ input }, (user: any) => [
    user.id,
    user.name,
    user.email,
    user.role,
    user.profile((profile: any) => [
      profile.bio,
      profile.location((location: any) => [
        location.city,
        location.country
      ])
    ])
  ])
]);
