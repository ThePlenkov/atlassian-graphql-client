/**
 * Test script to generate field types from test schema
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSchema } from 'graphql';
import { generateFieldTypes } from '../../src_typed/generate-field-types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const schemaPath = join(__dirname, 'schema.graphql');
const outputPath = join(__dirname, 'generated/field-types.ts');

// Read and build schema
const schemaSource = readFileSync(schemaPath, 'utf-8');
const schema = buildSchema(schemaSource);

// Generate field types
// Note: Using relative path because we're developing the library itself
const code = generateFieldTypes({
  schema,
  schemaTypesImportPath: './schema-types.js',
  helpersImportPath: '../../../src_typed/field-types-helpers.js'
});

// Write output
writeFileSync(outputPath, code);
console.log(`✅ Generated field types: ${outputPath}`);
