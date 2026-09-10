import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import globals from 'globals'
import tsParser from '@typescript-eslint/parser'

export default [
  js.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    ignores: ['dist/**', 'dist-docs/**', 'node_modules/**', '.git/**']
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tsParser
      }
    }
  },
  {
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/require-default-prop': 'off',
      'vue/no-v-html': 'warn',
      'no-prototype-builtins': 'error'
    }
  }
]
