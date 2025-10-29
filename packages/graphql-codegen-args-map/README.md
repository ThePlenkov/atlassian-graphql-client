# graphql-codegen-args-map

Custom GraphQL Code Generator plugin that generates an arguments type map for tree-shaking.

## Overview

This plugin generates a TypeScript map of all field arguments in your GraphQL schema, enabling gqlb to tree-shake unused types and reduce bundle sizes by 40-60%.

## Usage

This is an internal plugin used by the gqlb build pipeline. You typically don't need to use it directly.

```typescript
// codegen.ts
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  generates: {
    'src/generated/args-map.json': {
      plugins: ['graphql-codegen-args-map']
    }
  }
};

export default config;
```

## Output

Generates a JSON map of all field argument types:

```json
{
  "QueryjiraArgs": "QueryjiraArgs",
  "JiraQueryissueByKeyArgs": "JiraQueryissueByKeyArgs"
}
```

This map enables gqlb to:
- Dynamically resolve argument types at runtime
- Tree-shake unused types
- Reduce bundle sizes dramatically

## Technical Details

For complete technical documentation, see [docs/TECHNICAL.md](./docs/TECHNICAL.md).

## License

MIT
