import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier/flat';
import astro from 'eslint-plugin-astro';
import a11y from 'eslint-plugin-jsx-a11y-x';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  globalIgnores([
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.astro/**',
    '**/.turbo/**',
    '**/.vercel/**',
    '**/coverage/**',
    '**/test-results/**',
    '**/playwright-report/**'
  ]),
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx,astro}'],
    extends: [js.configs.recommended],
    languageOptions: { globals: { ...globals.node, ...globals.browser } }
  },
  {
    files: ['**/*.{ts,tsx,astro}'],
    extends: [tseslint.configs.recommended]
  },
  ...astro.configs.recommended,
  ...astro.configs['jsx-a11y-recommended'],
  {
    files: ['**/*.{jsx,tsx}'],
    extends: [a11y.configs.recommended, reactHooks.configs.flat.recommended]
  },
  {
    files: ['apps/web/tests/**/*.js'],
    languageOptions: { globals: { Bun: 'readonly', HTMLRewriter: 'readonly' } }
  },
  prettier
);
