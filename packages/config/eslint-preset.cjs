/** For apps/packages with no React (api-client, badge). "prettier" must stay last. */
const base = require("./eslint-base.cjs");

module.exports = {
  ...base,
  extends: [...base.extends, "prettier"]
};
