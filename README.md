# Astraguard Frontend

[![CI](https://github.com/Astraguard/Frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/Astraguard/Frontend/actions/workflows/ci.yml)

Dashboard, browser extension, and embeddable widgets that put Stellar trust scores in front of users.

## Overview

Astraguard surfaces trust and risk signals for the Stellar ecosystem so that users can make safer decisions before they interact with a project, sign a transaction, or shop with a merchant. This repository is the frontend layer, covering every user touchpoint from a single codebase:

- Check any Stellar project's live trust rating from a central dashboard.
- Get instant risk verdicts before signing a transaction, right in the browser.
- Shop with verified merchants backed by escrow and insurance, via embeddable widgets.

## Features

- **Trust Score Dashboard**: Browse and inspect live trust ratings for Stellar projects.
- **Browser Extension**: Instant risk verdicts inline, before signing a transaction.
- **Embeddable Widgets**: Merchants and projects display verified status backed by escrow and insurance.

## Tech Stack

Turborepo monorepo, managed with pnpm workspaces. See [`ARCHITECTURE.md`](./ARCHITECTURE.md) §4 for the full system design.

| App / Package         | Technology                         | Purpose                                                                      |
| --------------------- | ---------------------------------- | ---------------------------------------------------------------------------- |
| `apps/website`        | Next.js                            | Public site — marketing, docs, methodology                                   |
| `apps/dashboard`      | Next.js + TanStack Query           | Trust score explorer, project pages, claim filing                            |
| `apps/extension`      | Vite + `@crxjs/vite-plugin`, React | Browser extension (Manifest V3) — inline verdicts                            |
| `apps/badge`          | Plain TS (tsup, IIFE)              | Embeddable merchant badge widget, framework-free                             |
| `packages/ui`         | React                              | Shared components (`ScoreRing`, `VerdictBanner`, `RiskBadge`) + brand tokens |
| `packages/api-client` | TypeScript                         | Typed client for `astraguard-backend`'s public API                           |
| `packages/config`     | —                                  | Shared ESLint + `tsconfig` presets                                           |

## Quick Start

```sh
git clone https://github.com/Astraguard/Frontend.git
cd Frontend
pnpm install
cp .env.example .env.local   # fill in NEXT_PUBLIC_API_URL, etc.
pnpm dev                     # runs all apps in parallel via Turborepo
```

Run a single app: `pnpm --filter @astraguard/dashboard dev`. Other useful scripts: `pnpm build`, `pnpm lint`, `pnpm type-check`, `pnpm format`.

`pnpm install` also wires up a pre-commit hook (husky + lint-staged) that formats and lints staged files automatically.

## Roadmap

- [x] Monorepo scaffold (apps, shared packages, build tooling)
- [x] Repo guardrails — pre-commit hooks (lint-staged), CI, Renovate for dependency updates
- [x] Extension icons
- [x] Browser extension — Freighter signature interception (`src/content/page-hook.ts`), verified to build correctly; **not yet manually QA'd against the live Freighter extension in a browser**
- [ ] Wire `packages/api-client` to a live `astraguard-backend` (currently hand-typed, no backend running)
- [ ] Trust score dashboard — real data, score history sparkline, WebSocket live updates
- [ ] Support additional wallets beyond Freighter (xBull, etc.)
- [ ] Embeddable merchant widgets — CDN deploy with subresource integrity

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for setup, conventions, and the checks that run before a PR is mergeable. Dependency updates are automated via Renovate (`renovate.json`).

## License

No license has been specified yet for this project.
