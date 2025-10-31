/**
 * Measure generated code size and complexity
 */

import { readdirSync, statSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

interface CodeMetrics {
  approach: string;
  files: number;
  totalSize: number; // bytes
  totalLines: number;
  largestFile: string;
  largestFileSize: number;
  largestFileLines: number;
}

function countLines(filePath: string): number {
  const content = readFileSync(filePath, 'utf-8');
  return content.split('\n').length;
}

function measureDirectory(dir: string, approach: string): CodeMetrics {
  const files = readdirSync(dir, { recursive: true })
    .filter(f => typeof f === 'string' && f.endsWith('.ts') && !f.endsWith('.d.ts'))
    .map(f => join(dir, f as string));
  
  let totalSize = 0;
  let totalLines = 0;
  let largestFile = '';
  let largestFileSize = 0;
  let largestFileLines = 0;
  
  for (const file of files) {
    const stats = statSync(file);
    const lines = countLines(file);
    
    totalSize += stats.size;
    totalLines += lines;
    
    if (stats.size > largestFileSize) {
      largestFile = file.replace(dir + '/', '');
      largestFileSize = stats.size;
      largestFileLines = lines;
    }
  }
  
  return {
    approach,
    files: files.length,
    totalSize,
    totalLines,
    largestFile,
    largestFileSize,
    largestFileLines
  };
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function main() {
  console.log('📊 Measuring generated code...\n');
  
  const gqlbMetrics = measureDirectory('gqlb-approach/src/generated', 'gqlb + GraphQL Codegen');
  const typedBuilderMetrics = measureDirectory('typed-builder-approach/src/generated', 'typed-graphql-builder');
  
  console.log('gqlb + GraphQL Codegen:');
  console.log(`  Files: ${gqlbMetrics.files}`);
  console.log(`  Total Size: ${formatBytes(gqlbMetrics.totalSize)}`);
  console.log(`  Total Lines: ${gqlbMetrics.totalLines.toLocaleString()}`);
  console.log(`  Largest File: ${gqlbMetrics.largestFile} (${formatBytes(gqlbMetrics.largestFileSize)}, ${gqlbMetrics.largestFileLines.toLocaleString()} lines)`);
  console.log();
  
  console.log('typed-graphql-builder:');
  console.log(`  Files: ${typedBuilderMetrics.files}`);
  console.log(`  Total Size: ${formatBytes(typedBuilderMetrics.totalSize)}`);
  console.log(`  Total Lines: ${typedBuilderMetrics.totalLines.toLocaleString()}`);
  console.log(`  Largest File: ${typedBuilderMetrics.largestFile} (${formatBytes(typedBuilderMetrics.largestFileSize)}, ${typedBuilderMetrics.largestFileLines.toLocaleString()} lines)`);
  console.log();
  
  const sizeReduction = ((1 - gqlbMetrics.totalSize / typedBuilderMetrics.totalSize) * 100).toFixed(1);
  const lineReduction = ((1 - gqlbMetrics.totalLines / typedBuilderMetrics.totalLines) * 100).toFixed(1);
  
  console.log('📈 Comparison:');
  console.log(`  Size reduction: ${sizeReduction}%`);
  console.log(`  Line reduction: ${lineReduction}%`);
  console.log();
  
  // Save results
  mkdirSync('results', { recursive: true });
  const results = {
    timestamp: new Date().toISOString(),
    gqlb: gqlbMetrics,
    typedBuilder: typedBuilderMetrics,
    comparison: {
      sizeReduction: parseFloat(sizeReduction),
      lineReduction: parseFloat(lineReduction)
    }
  };
  
  writeFileSync('results/generated-code.json', JSON.stringify(results, null, 2));
  console.log('✅ Results saved to results/generated-code.json');
}

main();

