/**
 * Astraguard merchant badge. Embedded via:
 *
 *   <script src="https://badge.astraguard.io/v1.js" data-merchant="MERCHANT_ID"></script>
 *
 * Framework-free by design (ARCHITECTURE.md §4.1) to keep the embed light —
 * this must not pull in React or any other app dependency.
 *
 * Status is fetched live on every page load, never cached in the markup: a
 * suspended merchant's badge must visibly change state, or a cached
 * "verified" image becomes a forgery vector (ARCHITECTURE.md §4.2).
 */

type Verdict = "safe" | "caution" | "danger";

interface MerchantStatus {
  verdict: Verdict;
  score: number;
}

const COLORS: Record<Verdict, { fg: string; bg: string; border: string }> = {
  safe: { fg: "#0F6E56", bg: "#E6F3EF", border: "#0F6E56" },
  caution: { fg: "#8A6100", bg: "#FFF6E0", border: "#D69B00" },
  danger: { fg: "#8A1B1B", bg: "#FDE9E9", border: "#C22C2C" }
};

const LABELS: Record<Verdict, string> = {
  safe: "Verified by Astraguard",
  caution: "Unverified merchant",
  danger: "Flagged by Astraguard"
};

function getCurrentScript(): HTMLScriptElement | null {
  return (document.currentScript as HTMLScriptElement | null) ?? null;
}

async function fetchStatus(apiBaseUrl: string, merchantId: string): Promise<MerchantStatus> {
  const res = await fetch(`${apiBaseUrl}/v1/scores/${encodeURIComponent(merchantId)}`, {
    cache: "no-store"
  });
  if (!res.ok) throw new Error(`Astraguard badge: status fetch failed (${res.status})`);
  return res.json();
}

function renderBadge(
  container: HTMLElement,
  status: MerchantStatus,
  dashboardUrl: string,
  merchantId: string
): void {
  const colors = COLORS[status.verdict];
  const link = document.createElement("a");
  link.href = `${dashboardUrl}/project/${encodeURIComponent(merchantId)}`;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.style.cssText = [
    "display:inline-flex",
    "align-items:center",
    "gap:6px",
    "padding:4px 10px",
    "border-radius:999px",
    `border:1px solid ${colors.border}`,
    `background:${colors.bg}`,
    `color:${colors.fg}`,
    "font:600 12px system-ui,sans-serif",
    "text-decoration:none"
  ].join(";");
  link.textContent = `${LABELS[status.verdict]} · ${status.score}`;

  container.replaceChildren(link);
}

function renderFallback(container: HTMLElement): void {
  container.replaceChildren(document.createTextNode(""));
}

async function init(): Promise<void> {
  const script = getCurrentScript();
  if (!script) return;

  const merchantId = script.dataset.merchant;
  if (!merchantId) {
    console.error("Astraguard badge: missing data-merchant attribute");
    return;
  }

  const apiBaseUrl = script.dataset.apiUrl ?? "https://api.astraguard.io";
  const dashboardUrl = script.dataset.dashboardUrl ?? "https://app.astraguard.io";

  const container = document.createElement("span");
  container.id = `astraguard-badge-${merchantId}`;
  script.insertAdjacentElement("afterend", container);

  try {
    const status = await fetchStatus(apiBaseUrl, merchantId);
    renderBadge(container, status, dashboardUrl, merchantId);
  } catch (error) {
    renderFallback(container);
    console.error(error);
  }
}

void init();
