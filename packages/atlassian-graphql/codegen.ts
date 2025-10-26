import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  // Use the pre-filtered local schema file
  schema: 'src/generated/schema.graphql',
  
  // Read the generated operation documents
  documents: 'src/operations/**/*.graphql',
  
  generates: {
    // Generate types, operations, and generic SDK
    'src/generated/sdk.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-generic-sdk'],
      config: {
        skipTypename: false,
        enumsAsTypes: true,
        avoidOptionals: false,
      },
    },
  },
};

export default config;
