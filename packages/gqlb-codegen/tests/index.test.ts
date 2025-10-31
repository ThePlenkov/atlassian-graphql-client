/**
 * Test runner for gqlb-codegen - verifies field types generation
 */
import { describe, test } from 'node:test';
import { ok, match } from 'node:assert';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('gqlb-codegen field-types', () => {
  test('generates field-types.ts', () => {
    const outputPath = join(__dirname, 'schema/generated/field-types.ts');
    ok(existsSync(outputPath), 'field-types.ts should be generated');
  });

  test('includes helper type imports', () => {
    const outputPath = join(__dirname, 'schema/generated/field-types.ts');
    const content = readFileSync(outputPath, 'utf-8');
    
    match(content, /import type.*FieldSelection.*TypedVariable.*WithVariables/, 
      'Should import helper types');
    match(content, /export type.*FieldSelection.*TypedVariable.*WithVariables/,
      'Should re-export helper types');
  });

  test('imports schema types', () => {
    const outputPath = join(__dirname, 'schema/generated/field-types.ts');
    const content = readFileSync(outputPath, 'utf-8');
    
    match(content, /from ['"]\.\/schema-types\.js['"]/, 
      'Should import from schema-types.js');
  });

  test('generates QueryFields interface', () => {
    const outputPath = join(__dirname, 'schema/generated/field-types.ts');
    const content = readFileSync(outputPath, 'utf-8');
    
    match(content, /export interface QueryFields/, 
      'Should generate QueryFields interface');
    match(content, /hello:.*FieldSelection/, 
      'Should have hello field');
    match(content, /user:.*args.*FieldSelection/, 
      'Should have user field with args');
  });

  test('generates MutationFields interface', () => {
    const outputPath = join(__dirname, 'schema/generated/field-types.ts');
    const content = readFileSync(outputPath, 'utf-8');
    
    match(content, /export interface MutationFields/, 
      'Should generate MutationFields interface');
    match(content, /createUser:.*args.*FieldSelection/, 
      'Should have createUser field with args');
  });

  test('generates UserFields interface', () => {
    const outputPath = join(__dirname, 'schema/generated/field-types.ts');
    const content = readFileSync(outputPath, 'utf-8');
    
    match(content, /export interface UserFields/, 
      'Should generate UserFields interface');
    match(content, /id:.*FieldSelection/, 
      'Should have id field');
    ok(content.includes('posts:') && content.includes('PostFields'), 
      'Should have posts field with selection');
  });

  test('generates union types', () => {
    const outputPath = join(__dirname, 'schema/generated/field-types.ts');
    const content = readFileSync(outputPath, 'utf-8');
    
    match(content, /export type SearchItemFields = (UserFields \| PostFields|PostFields \| UserFields)/, 
      'Should generate union type');
  });

  test('handles nullable types correctly', () => {
    const outputPath = join(__dirname, 'schema/generated/field-types.ts');
    const content = readFileSync(outputPath, 'utf-8');
    
    // email is nullable String
    match(content, /email:.*string \| null/, 
      'Should mark nullable scalar fields');
    
    // profile is nullable UserProfile
    match(content, /profile:.*UserProfileFields \| null/, 
      'Should mark nullable object fields');
  });

  test('includes Args types for fields with arguments', () => {
    const outputPath = join(__dirname, 'schema/generated/field-types.ts');
    const content = readFileSync(outputPath, 'utf-8');
    
    match(content, /QueryUserArgs/, 
      'Should reference QueryUserArgs');
    match(content, /UserPostsArgs/, 
      'Should reference UserPostsArgs');
    match(content, /MutationCreateUserArgs/, 
      'Should reference MutationCreateUserArgs');
  });
});

