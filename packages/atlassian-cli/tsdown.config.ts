import { defineConfig } from 'tsdown';
import baseConfig from '../../tsdown.config.mjs';

export default defineConfig({
  ...baseConfig,
  entry: 'src/cli.ts',
  outDir: 'dist',
});

