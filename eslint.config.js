//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  ...tanstackConfig,
  {
    rules: {
      'no-console': ['off', { allow: ['warn', 'error'] }],
      'react/react-in-jsx-scope': 'off',
      'import/order': 'off',
      'sort-imports': 'off',
      'import/consistent-type-specifier-style': 'off',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/consistent-type-imports ': 'off',
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
