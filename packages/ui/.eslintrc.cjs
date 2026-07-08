// `extends` can't reference "@astraguard/config" by name — ESLint's shareable-config
// naming convention mangles scoped packages into "@astraguard/eslint-config-config",
// which doesn't exist. `require()` it directly instead.
module.exports = require("@astraguard/config/eslint-preset-react.cjs");
