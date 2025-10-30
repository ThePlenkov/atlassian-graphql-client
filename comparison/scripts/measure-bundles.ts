/**
 * Measure bundle sizes after tree-shaking
 */

import { statSync, readFileSync, writeFileSync, mkdirSync } from 'fs';

interface BundleMetrics {
  approach: string;
  bundleSize: number; // bytes
  gzipEstimate: number; // estimated gzip size
}

function estimateGzipSize(bytes: number): number {
  // Rough estimate: gzip typically compresses to 20-30% of original
  // Using 25% as a middle ground
  return Math.round(bytes * 0.25);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function main() {
  console.log('📦 Measuring bundle sizes...\n');
  
  try {
    const gqlbStats = statSync('gqlb-approach/dist/bundle.js');
    const typedBuilderStats = statSync('typed-builder-approach/dist/bundle.js');
    
    const gqlbMetrics: BundleMetrics = {
      approach: 'gqlb + GraphQL Codegen',
      bundleSize: gqlbStats.size,
      gzipEstimate: estimateGzipSize(gqlbStats.size)
    };
    
    const typedBuilderMetrics: BundleMetrics = {
      approach: 'typed-graphql-builder',
      bundleSize: typedBuilderStats.size,
      gzipEstimate: estimateGzipSize(typedBuilderStats.size)
    };
    
    console.log('gqlb + GraphQL Codegen:');
    console.log(`  Bundle Size: ${formatBytes(gqlbMetrics.bundleSize)}`);
    console.log(`  Gzip (est): ${formatBytes(gqlbMetrics.gzipEstimate)}`);
    console.log();
    
    console.log('typed-graphql-builder:');
    console.log(`  Bundle Size: ${formatBytes(typedBuilderMetrics.bundleSize)}`);
    console.log(`  Gzip (est): ${formatBytes(typedBuilderMetrics.gzipEstimate)}`);
    console.log();
    
    const bundleReduction = ((1 - gqlbMetrics.bundleSize / typedBuilderMetrics.bundleSize) * 100).toFixed(1);
    const gzipReduction = ((1 - gqlbMetrics.gzipEstimate / typedBuilderMetrics.gzipEstimate) * 100).toFixed(1);
    
    console.log('📈 Comparison:');
    console.log(`  Bundle size reduction: ${bundleReduction}%`);
    console.log(`  Gzip size reduction: ${gzipReduction}%`);
    console.log();
    
    // Save results
    mkdirSync('results', { recursive: true });
    const results = {
      timestamp: new Date().toISOString(),
      gqlb: gqlbMetrics,
      typedBuilder: typedBuilderMetrics,
      comparison: {
        bundleReduction: parseFloat(bundleReduction),
        gzipReduction: parseFloat(gzipReduction)
      }
    };
    
    writeFileSync('results/bundle-sizes.json', JSON.stringify(results, null, 2));
    console.log('✅ Results saved to results/bundle-sizes.json');
  } catch (error) {
    console.error('❌ Error: Make sure to run "npm run build:all" first');
    process.exit(1);
  }
}

main();

