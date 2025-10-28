import { defineConfig } from 'tsdown';
import baseConfig from '../../tsdown.config.mjs';

export default defineConfig({
  ...baseConfig,
  entry: 'src/index.ts',
  outDir: 'dist',
});

