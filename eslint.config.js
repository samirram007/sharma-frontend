//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'
import noUninterpolatedCodeTemplateLiteral from './eslint-rules/no-uninterpolated-code-template-literal.js'

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...tanstackConfig,
  {
    // Tooling-only JS files aren't part of any tsconfig project and would trip
    // the @typescript-eslint/parser "file not found in project" error.
    ignores: ['eslint-rules/**'],
  },
  {
    // Scope custom plugins + overrides to TS/TSX files: the '@typescript-eslint'
    // plugin is only declared by @tanstack/eslint-config for **/*.{ts,tsx}, so
    // applying its rules to .js/.mjs files fails config resolution.
    files: ['**/*.{ts,tsx}'],
    plugins: {
      local: {
        rules: {
          'no-uninterpolated-code-template-literal':
            noUninterpolatedCodeTemplateLiteral,
        },
      },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      'local/no-uninterpolated-code-template-literal': 'error',
      'no-console': ['off', { allow: ['warn', 'error'] }],
      'react/react-in-jsx-scope': 'off',
      'import/order': 'off',
      'sort-imports': 'off',
      'import/consistent-type-specifier-style': 'off',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/consistent-type-imports': 'off',
      'prefer-const': 'off',
      'import/first': 'off',
      'import/newline-after-import': 'off',
      'import/no-duplicates': 'off',
      'import/no-unresolved': 'off',
      'import/no-extraneous-dependencies': 'off',
      '@typescript-eslint/array-type': 'off',
      'react/jsx-no-undef': 'off',
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'off',
      'react/no-unknown-property': 'off',
      'react/jsx-key': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
    },
  },
]
