/**
 * Build-time environment validation for the dashboard.
 *
 * Next.js only inlines NEXT_PUBLIC_* vars at build time, so a missing var in
 * the build environment is completely silent — the built app ships with
 * "undefined" baked in. This module throws during `next build` if any
 * required var is absent, turning that silent misconfiguration into a hard
 * build failure that is immediately obvious in the deploy pipeline.
 *
 * Called from next.config.mjs so it runs before any compilation starts.
 */

interface Env {
  NEXT_PUBLIC_API_URL: string;
  NEXT_PUBLIC_WS_URL: string;
  NEXT_PUBLIC_STELLAR_NETWORK: string;
}

const REQUIRED_VARS = [
  "NEXT_PUBLIC_API_URL",
  "NEXT_PUBLIC_WS_URL",
  "NEXT_PUBLIC_STELLAR_NETWORK",
] as const;

/**
 * Validates that all required env vars are present.
 * Throws on the first missing var so the error message is unambiguous.
 * No-ops in development (`NODE_ENV === 'development'`) to keep local
 * dev ergonomics smooth — running without a full .env is common locally.
 */
export function validateEnv(): Env {
  if (process.env.NODE_ENV === "development") {
    // Warn in development so developers know what to fill in, but don't block.
    const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
    if (missing.length > 0) {
      console.warn(
        `[astraguard/dashboard] Missing env vars (non-fatal in development): ${missing.join(", ")}\n` +
          `  Copy .env.example → .env.local and fill in the values.`
      );
    }
    return buildEnv();
  }

  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `[astraguard/dashboard] Missing required environment variable(s): ${missing.join(", ")}\n` +
        `  Ensure these are set in your build environment before running \`next build\`.\n` +
        `  See .env.example for the full list and expected values.`
    );
  }

  return buildEnv();
}

function buildEnv(): Env {
  return {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "",
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL ?? "",
    NEXT_PUBLIC_STELLAR_NETWORK: process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? "",
  };
}

/** Validated env, safe to use anywhere in the app after module initialisation. */
export const env = validateEnv();
