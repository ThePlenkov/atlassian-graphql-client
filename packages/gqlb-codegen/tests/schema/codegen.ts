import type { CodegenConfig } from '@graphql-codegen/cli';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config: CodegenConfig = {
  schema: join(__dirname, 'schema.graphql'),
  generates: {
    // Generate standard TypeScript types
    [join(__dirname, 'generated/schema-types.ts')]: {
      plugins: ['typescript'],
      config: {
        skipTypename: false,
        enumsAsTypes: false,
        scalars: {
          DateTime: 'string'
        }
      }
    },
    // Generate field types using our new plugin
    [join(__dirname, 'generated/field-types.ts')]: {
      plugins: ['gqlb-codegen/field-types'],
      config: {
        schemaTypesImportPath: './schema-types.js',
        helpersImportPath: 'gqlb'
      }
    }
  }
};

export default config;

