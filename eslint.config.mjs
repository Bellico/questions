import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
})

const eslintConfig = [...compat.extends(
  'next/core-web-vitals',
  'eslint:recommended',
  'plugin:tailwindcss/recommended',
  'next/typescript',
), {
  languageOptions: {
    globals: {
      globalThis: true,
    },
  },

  rules: {
    indent: ['error', 2],
    quotes: ['error', 'single'],
    semi: ['error', 'never'],
    'no-unused-vars': 0,
    'react/no-unescaped-entities': 0,
    '@typescript-eslint/no-non-null-asserted-optional-chain': 0,
  },
}]

export default eslintConfig
