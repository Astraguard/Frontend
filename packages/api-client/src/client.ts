import type {
  Claim,
  ClaimSubmission,
  Project,
  RegistryReport,
  ScanRequest,
  ScanResponse,
  TrustScore
} from "./types";

export interface AstraguardClientOptions {
  baseUrl: string;
  apiKey?: string;
}

/** Thrown for non-2xx responses. `status` is 0 for network failures. */
export class AstraguardApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "AstraguardApiError";
  }
}

/** Thrown when a request is aborted by its `timeoutMs` budget. */
export class AstraguardTimeoutError extends AstraguardApiError {
  constructor(timeoutMs: number) {
    super(0, `Request timed out after ${timeoutMs}ms`);
    this.name = "AstraguardTimeoutError";
  }
}

interface RequestOptions extends RequestInit {
  /** Aborts and throws AstraguardTimeoutError if the request runs longer than this. */
  timeoutMs?: number;
}

/**
 * Thin typed fetch wrapper over astraguard-backend's public API
 * (ARCHITECTURE.md §2.1). Routes map 1:1 to `api/routes/*.ts` in that repo.
 *
 * This is hand-written scaffolding. The real client should be generated
 * from astraguard-backend's `openapi.yaml` in CI so a breaking API change
 * fails the frontend build (ARCHITECTURE.md §5.1) instead of shipping.
 */
export function createAstraguardClient({ baseUrl, apiKey }: AstraguardClientOptions) {
  async function request<T>(path: string, { timeoutMs, ...init }: RequestOptions = {}): Promise<T> {
    const controller = new AbortController();
    const timer = timeoutMs ? setTimeout(() => controller.abort(), timeoutMs) : undefined;

    try {
      const res = await fetch(`${baseUrl}${path}`, {
        ...init,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
          ...init.headers
        }
      });

      if (!res.ok) {
        throw new AstraguardApiError(res.status, await res.text());
      }

      return (await res.json()) as T;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new AstraguardTimeoutError(timeoutMs ?? 0);
      }
      throw error;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  return {
    // GET /v1/scores/:assetOrContract
    getScore(assetOrContract: string) {
      return request<TrustScore>(`/v1/scores/${encodeURIComponent(assetOrContract)}`);
    },

    // GET /v1/registry/:id  (project page detail)
    getProject(id: string) {
      return request<Project>(`/v1/registry/${encodeURIComponent(id)}`);
    },

    // POST /v1/scan — pre-transaction verdict, called by the extension's
    // background worker. Latency budget: ≤150ms (ARCHITECTURE.md §2.3);
    // enforced client-side too, so a hung request can't block a signature.
    scan(payload: ScanRequest, opts: { timeoutMs?: number } = {}) {
      return request<ScanResponse>("/v1/scan", {
        method: "POST",
        body: JSON.stringify(payload),
        timeoutMs: opts.timeoutMs ?? 150
      });
    },

    // POST /v1/registry — file a community report
    reportAddress(payload: { address: string; category: string; evidence: string }) {
      return request<RegistryReport>("/v1/registry", {
        method: "POST",
        body: JSON.stringify(payload)
      });
    },

    // POST /v1/claims — file an insurance claim
    fileClaim(payload: ClaimSubmission) {
      return request<Claim>("/v1/claims", {
        method: "POST",
        body: JSON.stringify(payload)
      });
    },

    // GET /v1/claims/:id
    getClaim(id: string) {
      return request<Claim>(`/v1/claims/${encodeURIComponent(id)}`);
    }
  };
}

export type AstraguardClient = ReturnType<typeof createAstraguardClient>;
