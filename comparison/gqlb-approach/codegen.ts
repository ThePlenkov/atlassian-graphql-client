import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: '../shared/schema.graphql',
  generates: {
    'src/generated/schema-types.ts': {
      plugins: ['typescript'],
      config: {
        skipTypename: true,
        scalars: {
          DateTime: 'string',
          JSON: 'unknown'
        }
      }
    },
    'src/generated/field-types.ts': {
      plugins: ['gqlb-codegen/field-types'],
      config: {
        schemaTypesImportPath: './schema-types.js'
      }
    }
  }
};

export default config;

