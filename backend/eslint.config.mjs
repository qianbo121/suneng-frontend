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

export default [
  { ignores: ['dist/**', 'node_modules/**'] },
  ...compat.config({
    parser: '@typescript-eslint/parser',
    parserOptions: {
      project: ['./tsconfig.json'],
      tsconfigRootDir: baseDirectory,
    },
    plugins: ['@typescript-eslint', 'prettier'],
    extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
    env: { node: true, es2021: true },
  }),
];
