/** @type {import('next').NextConfig} */

// Validate required environment variables at build time.
// next.config.mjs is evaluated before compilation starts, so any missing
// NEXT_PUBLIC_* var throws here with a clear error rather than silently
// baking "undefined" into the build output.
//
// We use a dynamic import via createRequire because next.config.mjs is an
// ES module but we need to run the validation synchronously before Next.js
// proceeds. Plain inline validation avoids needing to import the lib/env.ts
// module (which is compiled TS, not raw JS) from the config file.
const REQUIRED_VARS = [
  "NEXT_PUBLIC_API_URL",
  "NEXT_PUBLIC_WS_URL",
  "NEXT_PUBLIC_STELLAR_NETWORK",
];

if (process.env.NODE_ENV !== "development") {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `[astraguard/dashboard] Missing required environment variable(s): ${missing.join(", ")}\n` +
        `  Ensure these are set in your build environment before running \`next build\`.\n` +
        `  See .env.example for the full list and expected values.`
    );
  }
} else {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.warn(
      `[astraguard/dashboard] Missing env vars (non-fatal in development): ${missing.join(", ")}\n` +
        `  Copy .env.example \u2192 .env.local and fill in the values.`
    );
  }
}

const nextConfig = {
  transpilePackages: ["@astraguard/ui", "@astraguard/api-client"],
  reactStrictMode: true,
};

export default nextConfig;
