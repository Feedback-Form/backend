module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  plugins: [
    'security',
  ],
  extends: [
    'eslint:recommended',
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    'no-unused-vars': 'off',
    'class-methods-use-this': 'off',
    'no-underscore-dangle': 'off',
    'func-names': 'off',
    'consistent-return': 'off',
    quotes: [
      'error',
      'single',
    ],
    'max-len': ['error', {
      code: 140,
    }],
  },
};
