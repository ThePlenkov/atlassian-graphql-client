/**
 * Generate a markdown report from all comparison results
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function formatTime(ms: number): string {
  if (ms < 1000) return ms + 'ms';
  return (ms / 1000).toFixed(2) + 's';
}

function main() {
  console.log('📝 Generating comparison report...\n');
  
  if (!existsSync('results/generated-code.json') || 
      !existsSync('results/bundle-sizes.json')) {
    console.error('❌ Missing results files. Run comparisons first:');
    console.error('   npm run compare:all');
    process.exit(1);
  }
  
  const generatedData = JSON.parse(readFileSync('results/generated-code.json', 'utf-8'));
  const bundleData = JSON.parse(readFileSync('results/bundle-sizes.json', 'utf-8'));
  
  let buildData = null;
  if (existsSync('results/build-times.json')) {
    buildData = JSON.parse(readFileSync('results/build-times.json', 'utf-8'));
  }
  
  const report = `# GraphQL Query Builder Comparison Results

**Generated:** ${new Date().toLocaleString()}

## Executive Summary

| Metric | gqlb + Codegen | typed-graphql-builder | Improvement |
|--------|----------------|----------------------|-------------|
| **Generated Code** | ${formatBytes(generatedData.gqlb.totalSize)} | ${formatBytes(generatedData.typedBuilder.totalSize)} | **${generatedData.comparison.sizeReduction}% smaller** |
| **Lines of Code** | ${generatedData.gqlb.totalLines.toLocaleString()} | ${generatedData.typedBuilder.totalLines.toLocaleString()} | **${generatedData.comparison.lineReduction}% fewer** |
| **Bundle Size** | ${formatBytes(bundleData.gqlb.bundleSize)} | ${formatBytes(bundleData.typedBuilder.bundleSize)} | **${bundleData.comparison.bundleReduction}% smaller** |
| **Gzip Size (est)** | ${formatBytes(bundleData.gqlb.gzipEstimate)} | ${formatBytes(bundleData.typedBuilder.gzipEstimate)} | **${bundleData.comparison.gzipReduction}% smaller** |
${buildData ? `| **Total Build Time** | ${formatTime(buildData.gqlb.totalTime)} | ${formatTime(buildData.typedBuilder.totalTime)} | **${buildData.comparison.totalSpeedup}x faster** |` : ''}

## Generated Code Analysis

### File Count
- **gqlb approach**: ${generatedData.gqlb.files} files
- **typed-builder**: ${generatedData.typedBuilder.files} files

### Total Size
- **gqlb approach**: ${formatBytes(generatedData.gqlb.totalSize)}
- **typed-builder**: ${formatBytes(generatedData.typedBuilder.totalSize)}
- **Reduction**: ${generatedData.comparison.sizeReduction}%

### Lines of Code
- **gqlb approach**: ${generatedData.gqlb.totalLines.toLocaleString()} lines
- **typed-builder**: ${generatedData.typedBuilder.totalLines.toLocaleString()} lines
- **Reduction**: ${generatedData.comparison.lineReduction}%

### Largest File
- **gqlb approach**: \`${generatedData.gqlb.largestFile}\`
  - Size: ${formatBytes(generatedData.gqlb.largestFileSize)}
  - Lines: ${generatedData.gqlb.largestFileLines.toLocaleString()}
- **typed-builder**: \`${generatedData.typedBuilder.largestFile}\`
  - Size: ${formatBytes(generatedData.typedBuilder.largestFileSize)}
  - Lines: ${generatedData.typedBuilder.largestFileLines.toLocaleString()}

## Bundle Size Analysis

### Minified Bundle
- **gqlb approach**: ${formatBytes(bundleData.gqlb.bundleSize)}
- **typed-builder**: ${formatBytes(bundleData.typedBuilder.bundleSize)}
- **Reduction**: ${bundleData.comparison.bundleReduction}%

### Gzipped (estimated)
- **gqlb approach**: ${formatBytes(bundleData.gqlb.gzipEstimate)}
- **typed-builder**: ${formatBytes(bundleData.typedBuilder.gzipEstimate)}
- **Reduction**: ${bundleData.comparison.gzipReduction}%

${buildData ? `## Build Performance

### Code Generation
- **gqlb approach**: ${formatTime(buildData.gqlb.generationTime)}
- **typed-builder**: ${formatTime(buildData.typedBuilder.generationTime)}
- **Speedup**: ${buildData.comparison.generationSpeedup}x

### TypeScript Type Checking
- **gqlb approach**: ${formatTime(buildData.gqlb.typecheckTime)}
- **typed-builder**: ${formatTime(buildData.typedBuilder.typecheckTime)}
- **Speedup**: ${buildData.comparison.typecheckSpeedup}x

### Bundle Building
- **gqlb approach**: ${formatTime(buildData.gqlb.bundleTime)}
- **typed-builder**: ${formatTime(buildData.typedBuilder.bundleTime)}

### Total Build Time
- **gqlb approach**: ${formatTime(buildData.gqlb.totalTime)}
- **typed-builder**: ${formatTime(buildData.typedBuilder.totalTime)}
- **Speedup**: ${buildData.comparison.totalSpeedup}x
` : ''}
## Methodology

### Test Schema
- Realistic GraphQL schema with common patterns
- Multiple root types (Query, Mutation)
- Nested objects with pagination (Relay-style connections)
- Unions, interfaces, and scalar types
- See \`shared/schema.graphql\` for details

### Approaches Tested

#### 1. gqlb + GraphQL Codegen
- **Code Generation**: GraphQL Codegen with \`typescript\` plugin
- **Field Types**: Custom \`gqlb-codegen/field-types\` plugin
- **Runtime**: gqlb proxy-based query builder
- **Tree-shaking**: Direct imports from schema-types.ts

#### 2. typed-graphql-builder
- **Code Generation**: typed-graphql-builder compiler
- **Runtime**: Generated builder classes
- **Tree-shaking**: Partial (large class hierarchies)

### Measurements
- **Generated Code**: Lines, file size, file count
- **Bundle Size**: Minified bundle after tree-shaking (esbuild)
- **Build Times**: Generation + typecheck + bundle build
- **All measurements**: Averages across multiple runs

## Conclusions

### When gqlb Approach Excels

✅ **Production bundle size** - ${bundleData.comparison.bundleReduction}% smaller bundles (faster page loads)
✅ **Generated code size** - ${generatedData.comparison.lineReduction}% less code (better IDE autocomplete)
✅ **Tree-shaking** - Better dead code elimination with direct imports
✅ **Large schemas** - Benefits multiply with larger schemas (100+ types)

### Trade-offs

⚠️ **Build time** - Slightly slower (${buildData.gqlb.totalTime}ms vs ${buildData.typedBuilder.totalTime}ms total)
⚠️ **Setup complexity** - Requires GraphQL Codegen + custom plugin configuration
⚠️ **Runtime overhead** - Uses JavaScript Proxy API (small performance cost)
⚠️ **Maturity** - Newer approach, less battle-tested than traditional codegen

## Raw Data

All raw measurements are available in JSON format:
- \`results/generated-code.json\`
- \`results/bundle-sizes.json\`
${buildData ? '- `results/build-times.json`' : ''}

## Reproducibility

To reproduce these results:

\`\`\`bash
cd comparison
npm install
npm run full-comparison
\`\`\`

This will:
1. Clean all generated code
2. Generate code using both approaches
3. Build and bundle both approaches
4. Measure all metrics
5. Generate this report
`;

  writeFileSync('results/report.md', report);
  console.log('✅ Report generated: results/report.md\n');
  console.log('📄 Preview:');
  console.log('─'.repeat(60));
  console.log(report.split('\n').slice(0, 20).join('\n'));
  console.log('...');
  console.log('─'.repeat(60));
}

main();

