import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';

export default defineConfig(
    eslint.configs.recommended,
    tseslint.configs.recommended,
    {
        files: ['**/*.ts'],
        languageOptions: {
            parserOptions: {
                project: './tsconfig.json',
                sourceType: 'module',
            },
        },
        plugins: {
            prettier,
        },
        rules: {
            // Prettier integration
            'prettier/prettier': 'error',

            // Code quality
            'no-console': 'off',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',

            // Consistency
            eqeqeq: ['error', 'always'],
        },
    },
    {
        ignores: ['node_modules/', 'dist/', 'build/', 'eslint.config.js'],
    },
);
