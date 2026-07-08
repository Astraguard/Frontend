/**
 * Runs in the page's own JS context (`world: "MAIN"` in manifest.json), NOT
 * the extension's isolated world — this file has no `chrome.*` API access.
 * That's why it talks to `content/index.ts` (the isolated-world relay) via
 * `window.postMessage` instead of `chrome.runtime.sendMessage` directly.
 *
 * Why MAIN world at all: a dApp calls `window.freighterApi.signTransaction`
 * directly. The only way to see that call before it reaches the real
 * Freighter extension is to run in the same JS context as the dApp and wrap
 * the function on `window` before the dApp's own script runs
 * (`run_at: "document_start"`).
 *
 * API shape verified against Freighter's public source
 * (github.com/stellar/freighter/@stellar/freighter-api/src/signTransaction.ts):
 *
 *   signTransaction(xdr: string, opts?: { networkPassphrase?: string; address?: string })
 *     => Promise<{ signedTxXdr: string; signerAddress: string; error?: unknown }>
 */

export {}; // forces module context so `declare global` below is legal

interface FreighterSignOptions {
  networkPassphrase?: string;
  address?: string;
}

interface FreighterSignResult {
  signedTxXdr: string;
  signerAddress: string;
  error?: unknown;
}

interface FreighterApi {
  signTransaction: (xdr: string, opts?: FreighterSignOptions) => Promise<FreighterSignResult>;
}

declare global {
  interface Window {
    freighterApi?: FreighterApi;
  }
}

const REQUEST_SOURCE = "astraguard-page-hook";
const RESPONSE_SOURCE = "astraguard-content-script";

/** If the isolated-world relay doesn't answer in time, fail OPEN, not closed. */
const RELAY_TIMEOUT_MS = 2000;

interface ScanDecisionRequest {
  source: typeof REQUEST_SOURCE;
  type: "scan-request";
  id: string;
  payload: { xdr: string; networkPassphrase?: string; signerAddress?: string };
}

interface ScanDecisionResponse {
  source: typeof RESPONSE_SOURCE;
  type: "scan-response";
  id: string;
  decision: "proceed" | "block";
}

function requestDecision(payload: ScanDecisionRequest["payload"]): Promise<"proceed" | "block"> {
  const id = crypto.randomUUID();

  return new Promise((resolve) => {
    let settled = false;

    const timer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      window.removeEventListener("message", onMessage);
      // A broken relay must never permanently block wallet signing — that's
      // a worse outcome than a missed scan. Fail open.
      console.warn("[astraguard] verdict relay timed out, proceeding unscanned");
      resolve("proceed");
    }, RELAY_TIMEOUT_MS);

    function onMessage(event: MessageEvent) {
      const data = event.data as Partial<ScanDecisionResponse> | undefined;
      if (
        event.source !== window ||
        data?.source !== RESPONSE_SOURCE ||
        data.type !== "scan-response" ||
        data.id !== id
      ) {
        return;
      }
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      window.removeEventListener("message", onMessage);
      resolve(data.decision === "block" ? "block" : "proceed");
    }

    window.addEventListener("message", onMessage);
    window.postMessage(
      { source: REQUEST_SOURCE, type: "scan-request", id, payload } satisfies ScanDecisionRequest,
      "*"
    );
  });
}

function installHook(freighter: FreighterApi): void {
  const originalSignTransaction = freighter.signTransaction.bind(freighter);

  freighter.signTransaction = async (xdr, opts) => {
    const decision = await requestDecision({
      xdr,
      networkPassphrase: opts?.networkPassphrase,
      signerAddress: opts?.address
    });

    if (decision === "block") {
      throw new Error("Blocked by Astraguard: this transaction was flagged as dangerous.");
    }

    return originalSignTransaction(xdr, opts);
  };
}

function waitForFreighter(onReady: (api: FreighterApi) => void): void {
  if (window.freighterApi) {
    onReady(window.freighterApi);
    return;
  }
  // Freighter injects asynchronously after page load; there's no DOM event
  // for it, so a short poll is the pragmatic option (matches the approach
  // other wallet-security extensions use for injected-provider detection).
  const interval = window.setInterval(() => {
    if (window.freighterApi) {
      window.clearInterval(interval);
      onReady(window.freighterApi);
    }
  }, 250);
  window.setTimeout(() => window.clearInterval(interval), 15_000);
}

waitForFreighter(installHook);
