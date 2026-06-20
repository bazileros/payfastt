# Contributing

## Prerequisites

- [Bun](https://bun.sh) (v1.3.x) — package manager and runtime
- [Convex CLI](https://docs.convex.dev/cli) — for local backend dev
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) — Cloudflare deploys

## Setup

```bash
# Clone
git clone https://github.com/bazileros/payfastt
cd payfastt

# Install all dependencies (Bun workspace)
bun install

# Full bootstrap (codegen + build all packages)
bun run bootstrap

# Or step by step:
cd packages/payfast && bun run build:codegen  # codegen → tsc
cd ../..
bun run build                                  # turbo build all
```

## Development

```bash
bun run dev               # Start all apps in dev mode
bun run dev:web           # Frontend only (TanStack Router SPA)
bun run dev:server        # Convex dev server only
```

For the Convex dev server, you'll need env vars:

```bash
cd packages/backend
npx convex env set PAYFAST_MERCHANT_ID  your_id
npx convex env set PAYFAST_MERCHANT_KEY your_key
npx convex env set PAYFAST_PASSPHRASE   your_passphrase
npx convex env set PAYFAST_SANDBOX      true
```

## Codegen

When you change the Convex component schema (`packages/payfast/src/component/schema.ts`):

```bash
cd packages/payfast
convex codegen --component-dir ./src/component
```

This regenerates `_generated/` files. Run the build afterward.

## Linting

We use [Biome](https://biomejs.dev) for both linting and formatting:

```bash
bun run check             # Check all files
bunx biome check --write .  # Auto-fix
```

## TypeScript

```bash
bun run check-types       # Turbo check-types (all packages)
```

## Testing

```bash
cd packages/payfast
bun run test              # vitest run
bun run test:watch        # vitest watch mode
```

Tests use `convex-test` for in-memory Convex execution and `vitest` edge-runtime environment.

## Adding a new feature

1. **Component function** — add to `packages/payfast/src/component/lib.ts` (query/mutation/action)
2. **Expose in client** — add wrapper to `packages/payfast/src/client/index.ts` (`Payfast` class)
3. **React hook** — add to `packages/payfast/src/react/index.ts`
4. **Test** — add to `packages/payfast/src/client/index.test.ts` or `packages/payfast/src/component/*.test.ts`
5. **Document** — update `apps/docs/src/content/docs/payfast/` and `SKILL.md`

## Publishing

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the release process.

## Project structure

```
payfastt/
├── apps/
│   ├── web/              # Example TanStack Router SPA
│   └── docs/             # Documentation site (Astro Starlight)
├── packages/
│   ├── payfast/          # @bazileros/payfast — the Convex component
│   ├── backend/          # Example Convex backend
│   ├── ui/               # Shared shadcn/ui primitives
│   ├── config/           # Shared tsconfig.base.json
│   ├── env/              # Shared environment variable types
│   └── infra/            # Deployment infra (Alchemy)
└── .github/
    └── workflows/        # CI/CD pipeline
```

## CI/CD

Every push to main triggers tests, then deploys web (Cloudflare Pages), docs (Cloudflare Workers), and Convex backend. Tag `v*` to publish to npm. See [DEPLOYMENT.md](./DEPLOYMENT.md) for details.
