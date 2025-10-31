import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildSchema, GraphQLSchema } from 'graphql';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load schema from file
const schemaPath = join(__dirname, 'schema.graphql');
const schemaString = readFileSync(schemaPath, 'utf-8');

// Build GraphQL schema
export const schema: GraphQLSchema = buildSchema(schemaString);

