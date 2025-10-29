/**
 * GraphQL Code Generator Configuration for FULL Atlassian Schema
 * 
 * This generates types from the complete, unfiltered Atlassian schema.
 * These types are used ONLY to provide type safety for sdk.config.ts.
 * 
 * The actual runtime types come from codegen.ts (filtered schema).
 */

import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'src/generated/schema.full.graphql',
  generates: {
    // Generate types from FULL schema for typing sdk.config.ts
    // This allows autocomplete for ALL available operations, not just enabled ones
    'src/generated/schema-types.full.ts': {
      plugins: ['typescript'],
      config: {
        // Custom scalar mappings (must match codegen.ts)
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
        skipTypename: true,
        enumsAsTypes: true
      }
    }
  }
};

export default config;

