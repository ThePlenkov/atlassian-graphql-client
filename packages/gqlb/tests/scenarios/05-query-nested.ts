/**
 * Deeply nested query - FULLY TYPED with AUTO-INFERENCE!
 */
import { createQueryBuilder } from '../../src/index.js';
import { schema } from '../schema/index.js';
import type { QueryFields } from '../schema/generated/field-types.js';

const builder = createQueryBuilder<QueryFields>(schema);

export const query = builder.query(q => ({
  user: q.user({ id: '123' }, user => ({
    id: user.id,
    name: user.name,
    profile: user.profile(profile => ({
      bio: profile.bio,
      location: profile.location(location => ({
        city: location.city,
        country: location.country,
        coordinates: location.coordinates(coords => ({
          lat: coords.lat,
          lng: coords.lng
        }))
      }))
    }))
  }))
}));
