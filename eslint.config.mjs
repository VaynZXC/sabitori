// eslint.config.mjs  ─ конфиг в формате “flat”
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/**
 * 1) Подтягиваем стандартные правила Next:
 *    - core-web-vitals (accessibility, perf и т.д.)
 *    - typescript (рекомендованный набор от Next для TS-проектов)
 *
 * 2) Добавляем свой объект с overrides → переводим “красные” правила в warning
 *    или полностью выключаем.
 */
export default [
  // базовые next-конфиги
  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  // 👇 наши ручные правки
  {
    rules: {
      // падает билд → делаем warning
      '@typescript-eslint/no-explicit-any': 'warn',
      'react/no-unescaped-entities': 'warn',
      'prefer-const': 'warn',

      // опционально: тоже в warning или off
      '@typescript-eslint/no-unused-vars' : 'warn',
      '@next/next/no-img-element'         : 'off',
    },
  },
];
