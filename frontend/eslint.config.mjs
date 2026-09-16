import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const baseDirectory = path.dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({
  baseDirectory,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

const config = [
  {
    ignores: [
      'next-env.d.ts',
      '.next*/**',
      '.artifacts/**',
      'coverage/**',
      'private/**',
      'playwright-report/**',
      'test-results/**',
      'scripts/**/*.js',
      // Vendored Three.js build; keep our renderer and application code checked.
      'public/animations/furnaces/v3/three.module.min.js',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
];

export default config;
