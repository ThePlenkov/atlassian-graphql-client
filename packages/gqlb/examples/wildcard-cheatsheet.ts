/**
 * Wildcard Selection - Complete Cheatsheet
 * 
 * NEW FEATURE: Auto-select all scalar fields without listing them!
 */
import { createQueryBuilder } from '../src/index.js';

// Assume we have a schema with: User { id, name, profile { bio, location { city, country } } }
const builder = createQueryBuilder(schema);

// ============================================================================
// Pattern 1: Explicit wildcard with spread (most clear!)
// ============================================================================
builder.query(q => [
  q.user({ id: '123' }, user => [
    ...user['*']  // Expands to: id, name, email, age, role, status, createdAt
  ])
]);

// Generates:
// query {
//   user(id: "123") {
//     id
//     name
//     email
//     age
//     role
//     status
//     createdAt
//   }
// }


// ============================================================================
// Pattern 2: Mix wildcard with explicit nested selections
// ============================================================================
builder.query(q => [
  q.user({ id: '123' }, user => [
    ...user['*'],  // All scalar fields
    
    user.profile(profile => [  // Plus nested selections
      profile.bio,
      profile.avatar
    ])
  ])
]);

// Generates:
// query {
//   user(id: "123") {
//     id
//     name
//     email
//     age
//     role
//     status
//     createdAt
//     profile {
//       bio
//       avatar
//     }
//   }
// }


// ============================================================================
// Pattern 3: Reference nested object → auto-expands its scalars
// ============================================================================
builder.query(q => [
  q.user({ id: '123' }, user => [
    user.id,
    user.name,
    
    user.profile(profile => [
      profile.bio,
      profile.avatar,
      profile.location  // ← Expands to all Location scalars!
    ])
  ])
]);

// Generates:
// query {
//   user(id: "123") {
//     id
//     name
//     profile {
//       bio
//       avatar
//       location {
//         city       ← Auto-included!
//         country    ← Auto-included!
//       }
//     }
//   }
// }


// ============================================================================
// Pattern 4: Deep nesting with auto-expansion
// ============================================================================
builder.query(q => [
  q.user({ id: '123' }, user => [
    user.id,
    user.profile  // Expands ALL UserProfile scalars + nested Location scalars
  ])
]);

// Generates:
// query {
//   user(id: "123") {
//     id
//     profile {
//       bio
//       avatar
//       location {
//         city
//         country
//       }
//     }
//   }
// }


// ============================================================================
// ⚠️ IMPORTANT: Wildcard spread FLATTENS structure
// ============================================================================

// ❌ DON'T DO THIS (loses nesting):
builder.query(q => [
  q.user({ id: '123' }, user => [
    user.profile(profile => [
      ...profile.location['*']  // BAD: Flattens city, country into profile level
    ])
  ])
]);
// Generates (WRONG):
// profile {
//   city      ← Not nested under location!
//   country   ← Not nested under location!
// }

// ✅ DO THIS INSTEAD (preserves nesting):
builder.query(q => [
  q.user({ id: '123' }, user => [
    user.profile(profile => [
      profile.location  // GOOD: Preserves structure
    ])
  ])
]);
// Generates (CORRECT):
// profile {
//   location {
//     city
//     country
//   }
// }


// ============================================================================
// Use Cases
// ============================================================================

// 1. Quick prototyping - get all fields fast
builder.query(q => [
  q.users({ limit: 10 }, user => [
    ...user['*']  // Done! All fields in one line
  ])
]);

// 2. CLI tools - let users control depth
function _buildQuery(includeProfile: boolean) {
  return builder.query(q => [
    q.user({ id: userId }, user => [
      ...user['*'],
      ...(includeProfile ? [user.profile] : [])
    ])
  ]);
}

// 3. GraphQL explorer - show all available data
builder.query(q => [
  q.user({ id: '123' }, user => [
    ...user['*'],  // Show all user fields
    user.profile,  // Show all profile fields
  ])
]);

// 4. Smart defaults - scalars auto, relations manual
builder.query(q => [
  q.user({ id: '123' }, user => [
    ...user['*'],  // All user scalars
    user.posts({ limit: 5 }, post => [  // But control related data
      post.id,
      post.title
    ])
  ])
]);

