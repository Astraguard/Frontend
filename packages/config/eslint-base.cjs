/** Internal — not consumed directly. See eslint-preset.cjs / eslint-preset-react.cjs. */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  env: {
    es2022: true,
    node: true,
    browser: true
  },
  rules: {
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" }
    ],
    "no-console": ["warn", { allow: ["warn", "error"] }]
  },
  overrides: [
    {
      // .eslintrc.cjs / shared presets are CommonJS by necessity (ESLint's
      // legacy config loader doesn't support ESM import) — require() here
      // isn't a style choice.
      files: ["*.cjs"],
      rules: {
        "@typescript-eslint/no-var-requires": "off"
      }
    }
  ],
  ignorePatterns: ["dist/", ".next/", "node_modules/"]
};
