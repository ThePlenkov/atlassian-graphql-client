import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'tests/schema/schema.graphql',
  generates: {
    'tests/schema/generated/schema-types.ts': {
      plugins: ['typescript'],
      config: {
        skipTypename: false,
        enumsAsTypes: false,
        scalars: {
          DateTime: 'string'
        }
      }
    },
    'tests/schema/generated/field-types.ts': {
      plugins: ['gqlb-codegen/field-types'],
      config: {
        schemaTypesImportPath: './schema-types.js',
        helpersImportPath: '../../../src/field-types-helpers.js'
      }
    }
  }
};

export default config;

