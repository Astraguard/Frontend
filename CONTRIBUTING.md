# Contributing

## Setup

```sh
pnpm install
cp .env.example .env.local
pnpm dev
```

## Before opening a PR

```sh
pnpm format:check
pnpm lint
pnpm type-check
pnpm build
```

These also run in CI (`.github/workflows/ci.yml`) and as a pre-commit hook via lint-staged — the hook only checks staged files, so run the full commands above before pushing.

## Conventions

- One app/package per concern — see `ARCHITECTURE.md` §4 for the intended shape of `apps/*` and `packages/*`. Don't add cross-app imports; share code through `packages/*` instead.
- `packages/api-client` is hand-written scaffolding until `astraguard-backend` publishes `openapi.yaml`. If you're adding a route, add it there with the same shape as the existing methods, not ad-hoc `fetch()` calls in app code.
- `apps/badge` must stay dependency-free (no React, no `packages/ui`) — it ships to arbitrary third-party merchant sites and every KB matters.
- Extension changes that touch `src/content/page-hook.ts` run in the page's own JS context (`world: "MAIN"`), not the extension's isolated world — see the comment at the top of that file before changing it.
