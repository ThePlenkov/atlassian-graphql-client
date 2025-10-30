/**
 * GraphQL Code Generator Configuration for Atlassian GraphQL
 * 
 * Strategy: Use standard @graphql-codegen/typescript to generate base types,
 * then transform them with TypeScript utility types (ToFields) for the runtime builder.
 * 
 * NO static .graphql files - everything is built dynamically at runtime with gqlb!
 */

import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'src/generated/schema.graphql',
  generates: {
    // Generate standard TypeScript types from schema
    // These are transformed to FieldFn<> types using utility types
    'src/generated/schema-types.ts': {
      plugins: [
        'typescript',
        'typescript-operations'
      ],
      config: {
        // Custom scalar mappings
        scalars: {
          // Common scalars
          DateTime: 'string',
          Date: 'string',
          JSON: 'Record<string, unknown>',
          Long: 'number',
          BigDecimal: 'number',
          UUID: 'string',
          URL: 'string',
          Upload: 'File',
          // Atlassian-specific scalars
          AppStorageEntityValue: 'unknown',
          AppStoredCustomEntityFieldValue: 'unknown',
          AppStoredEntityFieldValue: 'unknown',
          CardPaletteColor: 'string',
          CardTypeHierarchyLevelType: 'string',
          JSDependency: 'unknown',
          MercuryJSONString: 'string',
          SoftwareBoardFeatureKey: 'string',
          SoftwareBoardPermission: 'string',
          SprintScopeChangeEventType: 'string',
          TrelloCardPosition: 'string',
          TrelloShortLink: 'string'
        },
        strictScalars: true,
        maybeValue: 'T | null',
        namingConvention: {
          typeNames: 'keep',
          enumValues: 'keep'
        },
        // Optimize for bundle size
        skipTypename: true,
        enumsAsTypes: true,
        // Generate field argument types (e.g., QueryjiraArgs, JiraQueryissueByKeyArgs)
        addUnderscoreToArgsType: false,
        fieldWrapperValue: '(T extends undefined ? never : T) | null | undefined',
        futureProofEnums: true,
        futureProofUnions: true
      }
    },
    // Generate field types for fully typed query builder
    'src/generated/field-types.ts': {
      plugins: ['gqlb-codegen/field-types'],
      config: {
        schemaTypesImportPath: './schema-types.js'
      }
    }
  }
};

export default config;

