import type { CodegenConfig } from '@graphql-codegen/cli';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config: CodegenConfig = {
  schema: join(__dirname, 'schema.graphql'),
  generates: {
    [join(__dirname, 'generated/schema-types.ts')]: {
      plugins: ['typescript'],
      config: {
        skipTypename: false,
        enumsAsTypes: false,
        scalars: {
          DateTime: 'string'
        }
      }
    }
  }
};

export default config;

