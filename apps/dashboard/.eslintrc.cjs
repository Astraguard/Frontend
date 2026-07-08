// See packages/ui/.eslintrc.cjs for why this is require() and not `extends`.
const base = require("@astraguard/config/eslint-preset-react.cjs");

module.exports = {
  ...base,
  extends: ["next/core-web-vitals", ...base.extends]
};
