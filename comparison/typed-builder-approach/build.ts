/**
 * Build script using esbuild for bundle size measurement
 */

import { build } from 'esbuild';
import { writeFileSync } from 'fs';

async function buildBundle() {
  // Build with tree-shaking (production mode)
  const result = await build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    minify: true,
    format: 'esm',
    platform: 'node',
    target: 'node18',
    outfile: 'dist/bundle.js',
    metafile: true,
    treeShaking: true,
    external: ['graphql'] // External dependency
  });
  
  // Write metafile for analysis
  writeFileSync('dist/meta.json', JSON.stringify(result.metafile, null, 2));
  
  console.log('✅ Bundle built successfully');
}

buildBundle().catch(console.error);

