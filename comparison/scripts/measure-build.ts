/**
 * Measure build times for both approaches
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFileSync, mkdirSync } from 'fs';

const execAsync = promisify(exec);

interface BuildMetrics {
  approach: string;
  generationTime: number; // ms
  typecheckTime: number; // ms
  bundleTime: number; // ms
  totalTime: number; // ms
}

async function measureCommand(command: string, cwd: string): Promise<number> {
  const start = Date.now();
  try {
    await execAsync(command, { cwd });
  } catch (error) {
    console.error(`Error running: ${command}`, error);
    throw error;
  }
  return Date.now() - start;
}

async function measureApproach(name: string, dir: string): Promise<BuildMetrics> {
  console.log(`⏱️  Measuring ${name}...`);
  
  // Clean first
  await execAsync('rm -rf src/generated dist', { cwd: dir });
  
  // Create directories for generated code
  await execAsync('mkdir -p src/generated', { cwd: dir });
  
  // Measure generation
  const generationTime = await measureCommand('npm run gen', dir);
  console.log(`  Generation: ${generationTime}ms`);
  
  // Measure typecheck
  const typecheckTime = await measureCommand('npm run typecheck', dir);
  console.log(`  Typecheck: ${typecheckTime}ms`);
  
  // Measure build
  const bundleTime = await measureCommand('npm run build', dir);
  console.log(`  Build: ${bundleTime}ms`);
  
  const totalTime = generationTime + typecheckTime + bundleTime;
  console.log(`  Total: ${totalTime}ms\n`);
  
  return {
    approach: name,
    generationTime,
    typecheckTime,
    bundleTime,
    totalTime
  };
}

async function main() {
  console.log('⏱️  Measuring build times...\n');
  console.log('This will take a few minutes...\n');
  
  try {
    const gqlbMetrics = await measureApproach(
      'gqlb + GraphQL Codegen',
      'gqlb-approach'
    );
    
    const typedBuilderMetrics = await measureApproach(
      'typed-graphql-builder',
      'typed-builder-approach'
    );
    
    const genSpeedup = (typedBuilderMetrics.generationTime / gqlbMetrics.generationTime).toFixed(2);
    const typecheckSpeedup = (typedBuilderMetrics.typecheckTime / gqlbMetrics.typecheckTime).toFixed(2);
    const totalSpeedup = (typedBuilderMetrics.totalTime / gqlbMetrics.totalTime).toFixed(2);
    
    console.log('📈 Comparison:');
    console.log(`  Generation speedup: ${genSpeedup}x faster`);
    console.log(`  Typecheck speedup: ${typecheckSpeedup}x faster`);
    console.log(`  Total speedup: ${totalSpeedup}x faster`);
    console.log();
    
    // Save results
    mkdirSync('results', { recursive: true });
    const results = {
      timestamp: new Date().toISOString(),
      gqlb: gqlbMetrics,
      typedBuilder: typedBuilderMetrics,
      comparison: {
        generationSpeedup: parseFloat(genSpeedup),
        typecheckSpeedup: parseFloat(typecheckSpeedup),
        totalSpeedup: parseFloat(totalSpeedup)
      }
    };
    
    writeFileSync('results/build-times.json', JSON.stringify(results, null, 2));
    console.log('✅ Results saved to results/build-times.json');
  } catch (error) {
    console.error('❌ Error measuring build times:', error);
    process.exit(1);
  }
}

main();

