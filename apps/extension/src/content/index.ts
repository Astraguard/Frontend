import { createRoot } from "react-dom/client";
import { createElement } from "react";
import { VerdictBanner } from "@astraguard/ui";
import type { ScanMessage } from "../background";
import type { ScanResponse, Verdict } from "@astraguard/api-client";

/**
 * Isolated-world relay for src/content/page-hook.ts (which runs in the
 * page's own JS context and has no chrome.* API access). This script does
 * the two things the page hook can't: call the background worker, and
 * render UI. See page-hook.ts for why the split exists.
 */

const REQUEST_SOURCE = "astraguard-page-hook";
const RESPONSE_SOURCE = "astraguard-content-script";
const SETTINGS_KEY = "astraguard:settings";

interface Settings {
  scanEnabled: boolean;
}

/** Returns the persisted user settings, defaulting to scan-on if never set. */
async function getSettings(): Promise<Settings> {
  const stored = await chrome.storage.sync.get(SETTINGS_KEY);
  const value = stored[SETTINGS_KEY] as Settings | undefined;
  return value ?? { scanEnabled: true };
}

/** How long a non-danger verdict banner stays on screen before self-dismissing. */
const INFO_BANNER_MS = 4000;

interface ScanDecisionRequest {
  source: typeof REQUEST_SOURCE;
  type: "scan-request";
  id: string;
  payload: { xdr: string; networkPassphrase?: string; signerAddress?: string };
}

function postDecision(id: string, decision: "proceed" | "block"): void {
  window.postMessage({ source: RESPONSE_SOURCE, type: "scan-response", id, decision }, "*");
}

async function requestScan(payload: ScanDecisionRequest["payload"]): Promise<ScanResponse> {
  return chrome.runtime.sendMessage({
    type: "astraguard:scan",
    payload
  } satisfies ScanMessage);
}

function mountBanner(): { root: ReturnType<typeof createRoot>; host: HTMLElement } {
  const host = document.createElement("div");
  host.id = `astraguard-root-${crypto.randomUUID()}`;
  host.style.position = "fixed";
  host.style.top = "16px";
  host.style.right = "16px";
  host.style.zIndex = "2147483647";
  document.documentElement.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });
  const mountPoint = document.createElement("div");
  shadow.appendChild(mountPoint);

  return { root: createRoot(mountPoint), host };
}

/**
 * `safe`/`caution` proceed immediately — the banner is informational only
 * and self-dismisses. `danger` blocks by default; the user must explicitly
 * override, and dismissing/ignoring the banner counts as "block".
 */
function showVerdictAndDecide(verdict: ScanResponse, requestId: string): void {
  const { root, host } = mountBanner();
  const decided: Verdict = verdict.verdict;

  function resolve(decision: "proceed" | "block") {
    postDecision(requestId, decision);
    root.unmount();
    host.remove();
  }

  if (decided !== "danger") {
    postDecision(requestId, "proceed");
    root.render(createElement(VerdictBanner, { verdict: decided, reasons: verdict.reasons }));
    window.setTimeout(() => {
      root.unmount();
      host.remove();
    }, INFO_BANNER_MS);
    return;
  }

  root.render(
    createElement(VerdictBanner, {
      verdict: decided,
      reasons: verdict.reasons,
      onOverride: () => resolve("proceed")
    })
  );
}

window.addEventListener("message", (event: MessageEvent) => {
  const data = event.data as Partial<ScanDecisionRequest> | undefined;
  if (event.source !== window || data?.source !== REQUEST_SOURCE || data.type !== "scan-request") {
    return;
  }
  if (!data.id || !data.payload) return;

  const { id, payload } = data;

  // Read the user's persisted setting before doing anything. If scanning has
  // been disabled by the user, short-circuit immediately so that the transaction
  // proceeds without being sent to the backend and without any UI being shown.
  getSettings()
    .then(({ scanEnabled }) => {
      if (!scanEnabled) {
        postDecision(id, "proceed");
        return;
      }
      return requestScan(payload).then((verdict) => showVerdictAndDecide(verdict, id));
    })
    .catch((error) => {
      console.error("[astraguard] scan relay failed", error);
      postDecision(id, "proceed"); // fail open — see page-hook.ts's RELAY_TIMEOUT_MS comment
    });
});
