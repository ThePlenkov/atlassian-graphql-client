/**
 * Field Types Module
 * 
 * Generates fully typed field definitions for gqlb's typed builder.
 * Can be used both as a GraphQL Codegen plugin or programmatically.
 */

// Export programmatic API
export { generateFieldTypes, type GenerateFieldTypesOptions } from './generate.js';

// Export plugin
export { plugin, type FieldTypesPluginConfig } from './plugin.js';

// Default export for GraphQL Codegen plugin usage
export { default } from './plugin.js';

