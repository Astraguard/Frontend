// packages/config ships eslintrc files themselves — give the package its
// own config (plain relative require, no scoped-package resolution needed)
// so ad-hoc `eslint <file>` invocations (e.g. lint-staged) can find one.
module.exports = require("./eslint-preset.cjs");
