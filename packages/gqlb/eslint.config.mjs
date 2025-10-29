import baseConfig from '../../eslint.config.mjs';
import jsoncParser from 'jsonc-eslint-parser';

export default [
  ...baseConfig,

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
          ],
          ignoredDependencies: [
            'graphql',
            '@graphql-typed-document-node/core',
          ],
        },
      ],
    },
  },
];

