import { defineConfig } from 'tsdown';
import baseConfig from '../../tsdown.config.mjs';

export default defineConfig({
  ...baseConfig,
  entry: ['src/cli.ts', 'src/jira-cli.ts', 'src/auth/config.ts', 'src/index.ts'],
  outDir: 'dist',
});

