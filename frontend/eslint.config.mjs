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
      'playwright-report/**',
      'test-results/**',
      'scripts/**/*.js',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
];

export default config;
