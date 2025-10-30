import { defineConfig } from 'tsdown';
import baseConfig from '../../tsdown.config.mjs';

export default defineConfig({
  ...baseConfig,
  entry: ['src/index.ts', 'src/create-typed-builder.ts', 'src/codegen-utils.ts'],
  outDir: 'dist',
});

