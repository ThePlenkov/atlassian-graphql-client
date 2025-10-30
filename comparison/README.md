# GraphQL Query Builder Comparison

Real-world comparison of **gqlb + GraphQL Codegen** vs **typed-graphql-builder** using the same schema.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run full comparison (clean + generate + build + measure + report)
npm run full-comparison

# 3. View results
cat results/report.md
```

**Or step by step:**
```bash
npm run gen:all        # Generate code for both approaches
npm run build:all      # Build bundles
npm run compare:all    # Measure everything
npm run compare:report # Generate report
```

## 📊 What Gets Measured

### 1. Generated Code Size
- Number of files generated
- Total size (KB) and lines of code
- Largest file metrics

### 2. Bundle Sizes
- Minified bundle size
- Estimated gzip size
- Tree-shaking effectiveness

### 3. Build Performance
- Code generation time
- TypeScript type-checking time
- Bundle build time
- Total build time

### 4. IDE Experience
Compare developer experience hands-on (see below)

## 🎯 Try the IDE Experience

**Open both test files side-by-side:**
```bash
code gqlb-approach/src/test-scenarios.ts
code typed-builder-approach/src/test-scenarios.ts
```

Both files implement the **same 8 scenarios**:
1. Get a single user by ID
2. Get user with their posts (paginated)
3. Search posts with full details
4. Get post with nested comments and replies
5. Get user's social graph (followers/following)
6. Create a new post (mutation)
7. Update user profile (mutation)
8. Complex search with unions

**Try these exercises:**

### Exercise 1: Autocomplete
- Inside any callback, type the parameter name + `.` (e.g., `user.`)
- Watch autocomplete suggestions appear
- **Compare:** Speed, number of suggestions, readability

### Exercise 2: Add a Field
- In any query, start typing a new field selection
- See how autocomplete helps you discover available fields
- **Compare:** How many keystrokes needed?

### Exercise 3: Type Errors
- Try adding `user.nonExistentField`
- Look at the TypeScript error
- **Compare:** Error clarity and helpfulness

### Exercise 4: Navigate Types
- Hover over any parameter
- Cmd/Ctrl+Click to go to type definition
- **Compare:** Where does it take you? Is it readable?

### Exercise 5: Complex Nesting
- Try building a deeply nested query from scratch
- **Compare:** How often does autocomplete help?

## 📈 Latest Results

After running the comparison, results are saved to `results/`:
- `generated-code.json` - Code size metrics
- `bundle-sizes.json` - Bundle size comparison
- `build-times.json` - Build performance
- `report.md` - Full human-readable report

**Key Findings (from latest run):**
- **79.6% smaller bundles** → faster page loads for users
- **68.3% less generated code** → better IDE performance
- **Similar build times** → gqlb slightly slower (3.5s vs 3.4s)

## 🏗️ Approaches Compared

### 1. gqlb + GraphQL Codegen
- **Location:** `gqlb-approach/`
- **Philosophy:** Minimal codegen + runtime proxies
- **Stack:**
  - GraphQL Codegen (typescript plugin) for base types
  - gqlb-codegen/field-types for FieldFn types
  - gqlb runtime for proxy-based query building

### 2. typed-graphql-builder
- **Location:** `typed-builder-approach/`
- **Philosophy:** Full code generation
- **Stack:**
  - typed-graphql-builder compiler
  - Generated builder classes

## 📁 Project Structure

```
comparison/
├── shared/
│   ├── schema.graphql         # Test GraphQL schema
│   └── fixtures.ts            # Shared test scenarios
│
├── gqlb-approach/
│   ├── src/
│   │   ├── index.ts           # Basic usage example
│   │   ├── test-scenarios.ts  # IDE experience tests
│   │   └── generated/         # Generated code (after gen)
│   ├── codegen.ts             # GraphQL Codegen config
│   └── package.json
│
├── typed-builder-approach/
│   ├── src/
│   │   ├── index.ts           # Basic usage example
│   │   ├── test-scenarios.ts  # IDE experience tests
│   │   └── generated/         # Generated code (after gen)
│   └── package.json
│
├── scripts/
│   ├── measure-generated.ts   # Measure generated code
│   ├── measure-bundles.ts     # Measure bundle sizes
│   ├── measure-build.ts       # Measure build times
│   └── generate-report.ts     # Create markdown report
│
└── results/                   # Measurement results (after running)
```

## 🔧 Available Scripts

```bash
# Generation
npm run gen:gqlb              # Generate gqlb code only
npm run gen:typed-builder     # Generate typed-builder code only
npm run gen:all               # Generate both

# Building
npm run build:gqlb            # Build gqlb approach
npm run build:typed-builder   # Build typed-builder approach
npm run build:all             # Build both

# Measurement
npm run compare:size          # Measure code & bundle sizes
npm run compare:build         # Measure build performance
npm run compare:all           # Run all measurements
npm run compare:report        # Generate markdown report

# Complete Workflow
npm run full-comparison       # Clean + gen + build + measure + report

# Cleanup
npm run clean                 # Remove all generated code and artifacts
```

## 🧪 Test with Your Schema

Want to test with your own GraphQL schema?

1. Replace `shared/schema.graphql` with your schema
2. Run the comparison:
   ```bash
   npm run full-comparison
   ```

That's it! The measurements will reflect your schema.

**Note:** The benefits of gqlb become more pronounced with larger schemas (100+ types, 1000+ fields).

## 📚 Related Documentation

- **[Main README](../README.md)** - Project overview
- **[gqlb Package](../packages/gqlb/README.md)** - Core library docs
- **[Innovation Deep Dive](../docs/INNOVATION.md)** - Technical architecture
- **[Full Comparison](../docs/COMPARISON.md)** - Detailed analysis

## 🎯 Goals

1. **Validate Claims** - Verify documentation claims with real data
2. **Transparency** - Show actual measurements, not estimates
3. **Reproducibility** - Anyone can run this comparison
4. **Continuous** - Update as implementations improve

## 💡 Questions?

- Check the main README: `../README.md`
- Review the full comparison: `../docs/COMPARISON.md`
- Open an issue: https://github.com/ThePlenkov/atlassian-graphql-client/issues
