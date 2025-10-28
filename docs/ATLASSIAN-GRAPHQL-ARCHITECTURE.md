# Architecture

## Custom GraphQL Code Generator Plugin

We created a **custom GraphQL Code Generator plugin** (`typescript-typed-builder`) as a monorepo package that wraps `typed-graphql-builder`'s compiler.

### Why a Custom Plugin?

**Benefits:**
- ✅ **Unified Configuration**: Single `codegen.ts` for all code generation
- ✅ **Integrated Workflow**: Works with codegen's pipeline
- ✅ **Nx Orchestration**: Proper task dependencies and caching
- ✅ **Reusable**: Could be published as a standalone npm package
- ✅ **Professional**: Follows GraphQL Code Generator conventions

**Challenges We Solved:**
1. **Module Resolution**: Made it a proper workspace package instead of local plugin
2. **ESM/CommonJS Interop**: Used dynamic `import()` to load CommonJS module
3. **Plugin Discovery**: Named it simply `typescript-typed-builder` for easy resolution

### How It Works:

```
GraphQL Code Generator
  ↓ loads plugin from workspace
packages/typescript-typed-builder
  ↓ wraps
typed-graphql-builder's compiler
  ↓ generates
Proxy-based TypeScript query builder
```

### Implementation:

```typescript
// packages/typescript-typed-builder/src/index.ts
export const plugin: PluginFunction = async (schema, documents, config) => {
  // Dynamic import to handle CommonJS/ESM interop
  const compileModule = await import('typed-graphql-builder/dist/compile.js');
  const compileSchemaDefinitions = compileModule.compileSchemaDefinitions;
  
  // Convert GraphQL Schema to AST
  const astNode = getCachedDocumentNodeFromSchema(schema);
  
  // Generate builder code
  return compileSchemaDefinitions(astNode.definitions, config);
};
```

### Configuration:

```typescript
// codegen.ts
const config: CodegenConfig = {
  schema: 'src/generated/schema.graphql',
  generates: {
    'src/generated/builder.ts': {
      plugins: ['typescript-typed-builder'],
      config: {
        includeTypename: false,
        scalars: [
          ['DateTime', './scalars#DateTime']
        ]
      }
    }
  }
};
```

## Generation Pipeline:

```
1. scripts/filter-schema.ts
   ↓ Fetches Atlassian schema
   ↓ Filters based on sdk.config.ts
   ↓ Outputs: src/generated/schema.graphql

2. typed-graphql-builder CLI
   ↓ Reads schema.graphql
   ↓ Generates proxy-based builder
   ↓ Outputs: src/generated/builder.ts (3.5MB)

3. TypeScript Build (tsdown)
   ↓ Compiles to dist/
   ↓ Outputs: CJS + ESM bundles
```

## File Structure:

```
packages/atlassian-graphql/
├── src/
│   ├── index.ts              # Exports Query, $, etc.
│   └── generated/
│       ├── schema.graphql    # Filtered Atlassian schema
│       └── builder.ts        # Generated typed builder (3.5MB)
├── scripts/
│   └── filter-schema.ts      # Schema filtering logic
├── project.json              # Nx tasks (gen:schema, gen:builder)
├── codegen.ts                # Reserved for future standard plugins
└── sdk.config.ts             # Declares which operations to include
```

