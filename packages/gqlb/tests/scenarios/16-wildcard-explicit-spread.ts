/**
 * Wildcard with explicit spread syntax - Most JavaScript-idiomatic!
 * 
 * Using the spread operator (...) makes it crystal clear that you're
 * selecting ALL scalars from a nested object.
 */
import { createQueryBuilder } from '../../src/index.js';
import { schema } from '../schema/index.js';
import type { QueryFields } from '../schema/generated/field-types.js';

const builder = createQueryBuilder<QueryFields>(schema);

// Test: Use the ['*'] wildcard with spread for maximum clarity
export const query = builder.query(q => [
  q.user({ id: '123' }, user => [
    // Select all User scalars with explicit spread
    // @ts-expect-error - '*' is a runtime wildcard feature
    ...user['*'],
    
    // Then add specific nested selections
    user.profile(profile => [
      profile.bio,
      profile.avatar,
      
      // For nested objects, just reference them to get all scalars
      profile.location  // Auto-expands to: location { city, country }
    ])
  ])
]);

