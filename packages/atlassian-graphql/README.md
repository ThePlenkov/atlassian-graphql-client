# Atlassian GraphQL SDK

A fully typed TypeScript SDK for the Atlassian GraphQL API, dynamically generated from a declarative configuration.

## 🎯 How It Works

1. **Declare what you want** in `sdk.config.ts`:
   ```typescript
   const config = {
     Query: {
       jira: {
         issue: {},
         issueSearch: {},
         rankField: {},
       },
       confluence: {
         blogPost: {},
         findSpaces: {},
       },
     },
     Mutation: {
       jira: {
         issueCreate: {},
         issueUpdate: {},
       },
     },
   };
   ```

2. **Run code generation**:
   ```bash
   npm run gen
   ```

3. **Get a fully typed SDK** with only the operations you specified!

## 🏗️ Architecture

### Custom Schema Loader
The custom schema loader (`loaders/schema-loader.ts`) reads your `sdk.config.ts` and:
1. Fetches the full Atlassian GraphQL schema
2. Filters it to only include your specified operations
3. Returns a pruned schema to GraphQL Code Generator

### Standard Codegen Pipeline
With the filtered schema, GraphQL Code Generator uses standard plugins to generate:
- **types.ts**: TypeScript types for all schema types
- **sdk.ts**: Typed SDK functions (when documents are provided)

## 📝 Configuration

Edit `sdk.config.ts` to customize which operations to include:

```typescript
const config = {
  Query: {
    [moduleName]: {
      [operationName]: {},  // Add operations here
    }
  },
  Mutation: {
    [moduleName]: {
      [operationName]: {},
    }
  }
};
```

Available modules discovered via schema analysis:
- `jira` - 217 operations available
- `confluence` - 39 operations available  
- `bitbucket`, `compass`, `trello`, etc.

## 🚀 Scripts

- **`npm run gen`** - Generate SDK from config
- **`npm run list:modules`** - List all available modules
- **`npm run analyze`** - Analyze schema structure
- **`npm run build`** - Compile TypeScript

## 📚 Usage

```typescript
import { GraphQLClient, getSdk } from '@your-org/atlassian-graphql';

// Create a GraphQL client
const client = new GraphQLClient('https://api.atlassian.com/graphql', {
  headers: {
    authorization: `Bearer ${process.env.ATLASSIAN_TOKEN}`,
  },
});

// Get the typed SDK
const sdk = getSdk(client);

// Make fully typed API calls
const issue = await sdk.Issue({ id: 'issue-123' });
const spaces = await sdk.FindSpaces({ 
  cloudId: 'your-cloud-id',
  first: 10 
});
const rank = await sdk.RankField({ cloudId: 'your-cloud-id' });
```

All operations are fully typed with IntelliSense support!

## 🛠️ Technical Details

- **Schema Filtering**: Uses `@graphql-tools/wrap` transforms (`FilterRootFields`, `FilterObjectFields`, `PruneSchema`)
- **Type Generation**: Uses `@graphql-codegen/typescript` plugin
- **SDK Generation**: Uses `@graphql-codegen/typescript-graphql-request` plugin
- **Modular Architecture**: Atlassian API uses namespaced modules (jira, confluence, etc.)

## 📦 Dependencies

- `graphql` - GraphQL implementation
- `graphql-request` - Lightweight GraphQL client
- `@graphql-codegen/*` - Code generation tools
- `@graphql-tools/*` - Schema manipulation utilities

## 🤝 Contributing

To add new operations:
1. Run `npm run list:modules` to see available modules
2. Edit `sdk.config.ts` to add desired operations
3. Run `npm run gen` to regenerate the SDK

## 🎓 Next Steps

Next enhancements to consider:

1. **Field selection** - Allow specifying which fields to select in operations (currently only returns `__typename`)
2. **Nested configuration** - Support complex field selections and fragments in `sdk.config.ts`
3. **Watch mode** - Auto-regenerate on config changes
4. **Multiple environments** - Support different configs for dev/prod

---

**Status**: ✅ Fully working! Schema filtering + operation generation + typed SDK
