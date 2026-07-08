import {
  createAstraguardClient,
  AstraguardApiError,
  AstraguardTimeoutError
} from "@astraguard/api-client";
import type { ScanRequest, ScanResponse } from "@astraguard/api-client";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";
const CACHE_TTL_MS = 60_000;

const client = createAstraguardClient({ baseUrl: API_BASE_URL });

export interface ScanMessage {
  type: "astraguard:scan";
  payload: ScanRequest;
}

/** Cheap non-crypto hash (FNV-1a) — just needs to be a short, stable cache key per unique XDR. */
function hashXdr(xdr: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < xdr.length; i++) {
    hash ^= xdr.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

function cacheKey(payload: ScanRequest): string {
  return `scan:${hashXdr(payload.xdr)}`;
}

async function getCachedVerdict(key: string): Promise<ScanResponse | null> {
  const stored = await chrome.storage.session.get(key);
  const entry = stored[key] as { verdict: ScanResponse; cachedAt: number } | undefined;
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > CACHE_TTL_MS) return null;
  return entry.verdict;
}

async function setCachedVerdict(key: string, verdict: ScanResponse): Promise<void> {
  await chrome.storage.session.set({ [key]: { verdict, cachedAt: Date.now() } });
}

/**
 * Handles scan requests from content scripts. Mirrors the backend's
 * Redis-first cache strategy (ARCHITECTURE.md §2.3) so a repeat prompt for
 * the same destination within the extension's own popup session is instant.
 */
chrome.runtime.onMessage.addListener((message: ScanMessage, _sender, sendResponse) => {
  if (message.type !== "astraguard:scan") return undefined;

  (async () => {
    const key = cacheKey(message.payload);
    const cached = await getCachedVerdict(key);
    if (cached) {
      sendResponse(cached);
      return;
    }

    try {
      const verdict = await client.scan(message.payload);
      await setCachedVerdict(key, verdict);
      sendResponse(verdict);
    } catch (error) {
      // Fail toward "caution", never "safe" — an unreachable backend must
      // never look like a clean bill of health.
      const reason =
        error instanceof AstraguardTimeoutError
          ? "Astraguard scan timed out"
          : error instanceof AstraguardApiError
            ? `Astraguard scan failed (${error.status})`
            : "Astraguard scan unreachable";
      console.error("[astraguard] scan failed", error);
      sendResponse({ verdict: "caution", score: 0, reasons: [reason] } satisfies ScanResponse);
    }
  })();

  return true; // keep the message channel open for the async response
});
