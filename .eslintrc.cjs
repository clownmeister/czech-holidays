module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true
  },
  extends: ['standard-with-typescript', 'prettier'],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json'
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],

  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/consistent-type-definitions': 'off', // use types or interfaces
    '@typescript-eslint/restrict-template-expressions': 'off', // allow `${accountId}/` instead of `${accountId ?? ''}/`
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        prefer: 'type-imports',
        fixStyle: 'separate-type-imports'
      }
    ],
    '@typescript-eslint/consistent-type-assertions': 'off',
    '@typescript-eslint/prefer-reduce-type-parameter': 'off',
    '@typescript-eslint/await-thenable': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/array-types': 'off'
  },
  ignorePatterns: ['/*', '!/src']
};
