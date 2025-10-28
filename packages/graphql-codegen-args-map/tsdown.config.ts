import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  target: 'es2020',
  platform: 'node',
  external: [
    '@graphql-codegen/plugin-helpers',
    'graphql'
  ]
});

