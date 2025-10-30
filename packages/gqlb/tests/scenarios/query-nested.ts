/**
 * Query with deeply nested selections (3 levels)
 */
import { createQueryBuilder } from '../../src/index.js';
import { schema } from '../schema/index.js';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';

const builder = createQueryBuilder(schema);

export const query: TypedDocumentNode = builder.query((q: any) => [
  q.user({ id: '123' }, (user: any) => [
    user.id,
    user.name,
    user.profile((profile: any) => [
      profile.bio,
      profile.location((location: any) => [
        location.city,
        location.country,
        location.coordinates((coords: any) => [
          coords.lat,
          coords.lng
        ])
      ])
    ])
  ])
]);

