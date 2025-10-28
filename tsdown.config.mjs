import { defineConfig } from 'tsdown';

export default defineConfig({
  platform: 'node',
  target: 'es2020',
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
});

