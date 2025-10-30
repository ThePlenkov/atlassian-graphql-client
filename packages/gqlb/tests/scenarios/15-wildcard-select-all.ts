/**
 * Wildcard selection - Select all scalars automatically!
 * 
 * NEW FEATURE: You can now reference nested objects directly to select all their scalars:
 * - user.profile - selects all scalars in profile (bio, avatar)
 * - user.profile.location - selects all scalars in location (city, country)
 * 
 * This is WAY simpler than listing every field!
 */
import { createQueryBuilder } from '../../src/index.js';
import { schema } from '../schema/index.js';
import type { QueryFields } from '../schema/generated/field-types.js';

const builder = createQueryBuilder<QueryFields>(schema);

// Test: Select all scalar fields from nested objects using simple path notation
export const query = builder.query(q => [
  q.user({ id: '123' }, user => [
    // Explicit field selections
    user.id,
    user.name,
    user.email,
    user.age,
    user.role,
    user.status,
    user.createdAt,
    
    // NEW: Just reference the nested object to get all its scalars!
    user.profile(profile => [
      // You can also mix explicit fields with auto-expanded nested objects:
      profile.bio,
      profile.avatar,
      
      // This single line expands to: city, country (all Location scalars)
      profile.location
    ])
  ])
]);

