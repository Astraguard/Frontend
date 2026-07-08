/** For apps/packages that render UI (ui, website, dashboard, extension). "prettier" must stay last. */
const base = require("./eslint-base.cjs");

module.exports = {
  ...base,
  parserOptions: {
    ...base.parserOptions,
    ecmaFeatures: { jsx: true }
  },
  plugins: [...base.plugins, "react", "react-hooks"],
  extends: [
    ...base.extends,
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  settings: {
    react: { version: "detect" }
  },
  rules: {
    ...base.rules,
    "react/react-in-jsx-scope": "off"
  }
};
