import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["iife"],
  globalName: "AstraguardBadge",
  minify: true,
  sourcemap: true,
  outDir: "dist",
  outExtension: () => ({ js: ".js" })
});
