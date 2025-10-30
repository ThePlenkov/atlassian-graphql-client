/**
 * Deeply nested query - FULLY TYPED, NO any!
 */
import { createTypedBuilder } from '../../src/create-typed-builder.js';
import { schema } from '../schema/index.js';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import type { QueryFields } from '../schema/generated/field-types.js';

const builder = createTypedBuilder<QueryFields>(schema);

export const query: TypedDocumentNode = builder.query(q => [
  q.user({ id: '123' }, user => [
    user.id,
    user.name,
    user.profile(profile => [
      profile.bio,
      profile.location(location => [
        location.city,
        location.country,
        location.coordinates(coords => [
          coords.lat,
          coords.lng
        ])
      ])
    ])
  ])
]);
