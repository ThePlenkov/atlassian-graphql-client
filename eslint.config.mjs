import nxPlugin from '@nx/eslint-plugin';
import jsoncParser from 'jsonc-eslint-parser';

export default [
  // Apply Nx base flat config
  ...nxPlugin.configs['flat/base'],
  
  // Apply Nx TypeScript flat config
  ...nxPlugin.configs['flat/typescript'],
  
  // Apply Nx JavaScript flat config
  ...nxPlugin.configs['flat/javascript'],

  // Global ignore patterns
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '**/dist/**',
      '**/*.d.ts',
      '**/*.d.mts',
      '**/*.d.cts',
      'coverage/**',
    ],
  },

  // JSON file configuration with dependency checks
  {
    files: ['**/*.json'],
    languageOptions: {
      parser: jsoncParser,
    },
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          // Ignore config files - they often use devDependencies
          ignoredFiles: [
            '{projectRoot}/**/*.config.{ts,js,cts,mts,cjs,mjs}',
          ]          
        },
      ],
    },
  },

  // Custom overrides for your workspace
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
      // Relax some strict rules
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
    },
  },

  // Allow workspace config files to import from root
  {
    files: ['**/tsdown.config.ts'],
    rules: {
      '@nx/enforce-module-boundaries': 'off',
    },
  },

  // Relax rules for test files
  {
    files: ['**/*.test.ts', '**/*.spec.ts', '**/e2e/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // Relax rules for script files
  {
    files: ['**/scripts/**/*.ts', '**/plugins/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-useless-escape': 'off',
    },
  },
];

