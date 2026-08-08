# Astraguard Frontend — Architecture

This document describes the design of the Astraguard frontend monorepo: how the
pieces fit together, why key decisions were made, and what a contributor needs to
understand before touching any of the apps or packages.

---

## §1  Repository layout

```
Frontend/
├── apps/
│   ├── dashboard/     Next.js — trust score explorer, project pages, claim filing
│   ├── extension/     Vite + @crxjs/vite-plugin — MV3 browser extension
│   ├── website/       Next.js — marketing, docs, methodology
│   └── badge/         Plain TS (tsup, IIFE) — embeddable merchant widget
└── packages/
    ├── ui/            Shared React components + brand tokens
    ├── api-client/    Typed HTTP client for astraguard-backend
    └── config/        Shared ESLint + tsconfig presets
```

All apps and packages are wired together by a **Turborepo** build graph managed
with **pnpm workspaces**. `pnpm build` runs all builds in dependency order;
individual apps can be filtered with `pnpm --filter @astraguard/<name> <cmd>`.

---

## §2  Data flow

```
User visits a dApp
      │
      ▼
page-hook.ts (MAIN world)
  wraps window.freighterApi.signTransaction
      │  window.postMessage (scan-request)
      ▼
index.ts (isolated world)
  chrome.runtime.sendMessage → background service worker
      │  fetch to astraguard-backend /scan
      ▼
background/index.ts
  returns ScanResponse { verdict, reasons }
      │
      ▼
index.ts renders VerdictBanner (Shadow DOM)
  postMessage (scan-response: proceed | block)
      │
      ▼
page-hook.ts resolves or rejects the original signTransaction call
```

The split between `page-hook.ts` (MAIN world) and `index.ts` (isolated world) is
mandated by the Chrome extension security model: only the isolated world has
access to `chrome.*` APIs, but only the MAIN world can intercept properties on
the page's `window` object before dApp scripts run.

---

## §3  Extension internal design

### 3.1  page-hook.ts — MAIN world intercept

- Runs at `document_start` so the hook is in place before any dApp script
  executes.
- Wraps `window.freighterApi.signTransaction` with a proxy that:
  1. Sends the XDR to the isolated-world relay via `window.postMessage`.
  2. Waits up to `RELAY_TIMEOUT_MS` (2 s) for a verdict.
  3. **Fails open** on timeout — a missed scan is preferable to permanently
     blocking a user's wallet. This is an explicit, documented trade-off.
  4. If the verdict is `danger`, throws an error that surfaces to the dApp;
     all other verdicts allow the original call to proceed.
- Has **no** `chrome.*` API access. All communication with the extension
  backend goes through `index.ts`.

### 3.2  index.ts — isolated-world relay

- Listens for `scan-request` messages from the page (filtered by the
  `astraguard-page-hook` source tag to reject spoofed messages).
- Reads user settings from `chrome.storage.sync`; if scanning is disabled,
  short-circuits immediately with `proceed`.
- Calls `chrome.runtime.sendMessage` to the background service worker.
- Renders a `VerdictBanner` inside a Shadow DOM host so that dApp CSS cannot
  interfere with the UI.

### 3.3  background/index.ts — service worker

- Receives `astraguard:scan` messages and forwards the XDR to the
  `astraguard-backend` REST API.
- Returns a `ScanResponse` to the content script.

### 3.4  Popup

- Provides a toggle to enable/disable scanning (persisted in
  `chrome.storage.sync`).

---

## §4  Package responsibilities

| Package | Owns |
|---|---|
| `@astraguard/ui` | `VerdictBanner`, `ScoreRing`, `RiskBadge` components; brand tokens (color, spacing) |
| `@astraguard/api-client` | `ScanResponse`, `Verdict` types; typed `fetch` wrapper for `/scan` and trust-score endpoints |
| `@astraguard/config` | Shared `tsconfig` bases; shared ESLint flat-config presets |

---

## §5  Extension permissions — rationale and Chrome Web Store justification

### Why `host_permissions: ["https://*/*"]` is required

Astraguard must intercept `window.freighterApi.signTransaction` **before** the
call reaches the real Freighter wallet extension. Achieving this requires:

1. **`world: "MAIN"`** — the hook must run in the page's own JS context so it
   can wrap a property on `window`. Extensions' default isolated world cannot
   touch `window` properties that belong to the page.

2. **`run_at: "document_start"`** — the hook must be installed before any dApp
   script runs, otherwise a dApp that calls `signTransaction` on first load
   would bypass the intercept entirely.

3. **`matches: ["https://*/*"]`** — Stellar dApps are deployed on
   arbitrary, user-chosen domains. Unlike a bank or social-network extension
   that targets a single known hostname, there is no maintained allowlist of
   every possible dApp domain. New dApps appear constantly on new domains. A
   curated allowlist would silently fail to protect users on any dApp not yet
   on the list — a worse outcome than the broad permission.

These three requirements together make `https://*/*` the **minimum** permission
set that keeps the protection model intact across the full universe of dApps.

### Why `activeTab` or optional/runtime-requested permissions cannot substitute

| Alternative | Why it fails |
|---|---|
| `activeTab` | Granted only on explicit user gesture (clicking the toolbar icon). A `signTransaction` call happens programmatically inside the dApp; the hook must be installed at `document_start`, long before any gesture is possible. `activeTab` fires too late. |
| `optional_host_permissions` + `chrome.permissions.request` | Requires a user gesture to prompt. A mid-transaction permission prompt would be jarring and almost certainly denied, leaving the user unprotected exactly when they need the scan most. |
| Domain allowlist | Brittle: requires ongoing maintenance, misses new dApps, and creates a false sense of complete coverage. |

### Chrome Web Store permission justification (copy for the listing)

> **Host permission: Read and change data on all https:// sites**
>
> Astraguard intercepts Stellar transaction signing calls (`freighterApi.signTransaction`)
> to scan them for risk before they are submitted to the blockchain. Because Stellar
> dApps are deployed on arbitrary HTTPS domains — there is no fixed set of known
> dApp URLs — the extension must be present on every HTTPS page. The hook is
> installed at `document_start` using a `world: "MAIN"` content script; this is
> the only technically viable approach for pre-signing interception. No page
> content is read, exfiltrated, or modified beyond injecting the security hook
> and displaying an in-page risk banner when a transaction is detected.

### Revisiting this decision

This decision should be re-evaluated if/when Chrome ships a first-class
"wallet-provider interception" API or if the Freighter extension exposes a
trusted side-channel (e.g., a cross-extension message port) that would let
Astraguard receive transaction events without needing a MAIN-world content
script on every page.

---

## §6  Security model and trust boundaries

| Boundary | Threat | Mitigation |
|---|---|---|
| `window.postMessage` between MAIN and isolated worlds | A malicious page script forges a `scan-response` to force `proceed` on a dangerous TX | Messages are filtered by `source` tag (`astraguard-content-script`); the isolated world is the authoritative responder |
| `window.postMessage` — forged `scan-request` | A page script triggers spurious scans to exhaust the backend or annoy the user | Scan requests are only acted on if they carry `source: "astraguard-page-hook"` and a valid `id`; no sensitive data is returned to the page — only `proceed`/`block` |
| Shadow DOM for VerdictBanner | dApp CSS overrides the verdict UI to hide a `danger` warning | UI is rendered inside `attachShadow({ mode: "open" })` which is opaque to external stylesheets |
| Fail-open on relay timeout | A slow or crashed background worker permanently blocks wallet signing | `RELAY_TIMEOUT_MS = 2000` after which the hook resolves with `proceed` and logs a warning |

---

## §7  Build and tooling

- **Vite + `@crxjs/vite-plugin`** handles manifest processing, content-script
  bundling, and hot-reload in dev mode for the extension.
- **Turborepo** caches build outputs; `turbo.json` defines the `build → lint →
  type-check` pipeline.
- **Husky + lint-staged** runs Prettier and ESLint on staged files before every
  commit.
- **Renovate** (`renovate.json`) automates dependency updates with grouped PRs.
- **GitHub Actions** CI runs `pnpm build`, `pnpm lint`, and `pnpm type-check`
  on every push and PR (`.github/workflows/ci.yml`).
