/**
 * Build-time environment validation for the browser extension.
 *
 * Vite replaces import.meta.env.* at build time, so a missing VITE_*
 * var is silently inlined as undefined. This module throws during `vite build`
 * (via the module-level call at the bottom) if any required var is absent,
 * turning that silent misconfiguration into a hard build failure.
 *
 * Consumed by:
 *   - src/background/index.ts  (service worker)
 *   - src/popup/main.tsx        (popup entry point)
 */

interface Env {
  VITE_API_URL: string;
}

const REQUIRED_VARS: Array<keyof Env> = ["VITE_API_URL"];

/**
 * Validates that all required env vars are present.
 * Throws immediately if any are missing so Vite's build process exits with a
 * non-zero status code and a clear, actionable error message.
 * No-ops in development to keep local dev ergonomics smooth.
 */
export function validateEnv(): Env {
  if (import.meta.env.DEV) {
    const missing = REQUIRED_VARS.filter(
      (key) => !import.meta.env[key as keyof ImportMetaEnv]
    );
    if (missing.length > 0) {
      console.warn(
        `[astraguard/extension] Missing env vars (non-fatal in development): ${missing.join(", ")}\n` +
          `  Copy .env.example → .env.local and fill in the values.`
      );
    }
    return buildEnv();
  }

  const missing = REQUIRED_VARS.filter(
    (key) => !import.meta.env[key as keyof ImportMetaEnv]
  );
  if (missing.length > 0) {
    throw new Error(
      `[astraguard/extension] Missing required environment variable(s): ${missing.join(", ")}\n` +
        `  Ensure these are set in your build environment before running \`vite build\`.\n` +
        `  See .env.example for the full list and expected values.`
    );
  }

  return buildEnv();
}

function buildEnv(): Env {
  return {
    VITE_API_URL: (import.meta.env.VITE_API_URL as string | undefined) ?? "",
  };
}

/** Validated env, safe to use anywhere in the extension after module initialisation. */
export const env = validateEnv();
