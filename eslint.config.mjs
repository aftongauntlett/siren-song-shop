import js from '@eslint/js';
import astroPlugin from 'eslint-plugin-astro';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['dist/**', '.astro/**', 'node_modules/**']
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astroPlugin.configs['flat/recommended'],
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,astro}'],
    plugins: {
      'jsx-a11y': jsxA11y
    },
    rules: {
      ...jsxA11y.configs.recommended.rules,
      ...jsxA11y.configs.strict.rules,
      '@typescript-eslint/no-explicit-any': 'error'
    }
  }
];
