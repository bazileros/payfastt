# Deployment

## CI/CD pipeline

```
push to main                 git tag v*
    │                             │
    ▼                             ▼
test.yml (reusable) ──► deploy-web.yml    Cloudflare Pages (payfastt.dev)
    │                    deploy-docs.yml   Cloudflare Workers (payfastt.dev/docs)
    │                    deploy-convex.yml  Convex backend
    │
    └────────────────► publish.yml        npm (bazileros/payfast)
```

Every deploy job waits for tests to pass before running. The test suite runs lint (Biome), typecheck (tsc), and unit tests (vitest).

## Triggers

| Workflow | Triggers on | What it deploys |
|---|---|---|
| `deploy-web.yml` | Push to `main` touching `apps/web/**` or `packages/**` | Cloudflare Pages |
| `deploy-docs.yml` | Push to `main` touching `apps/docs/**` or `packages/**` | Cloudflare Workers SSR |
| `deploy-convex.yml` | Push to `main` touching `packages/backend/**` or `packages/payfast/**` | Convex backend via `npx convex deploy` |
| `publish.yml` | Git tag matching `v*` (e.g. `v0.2.0`) | npm package `@bazileros/payfast` |

## Required secrets

Set these in GitHub repo → Settings → Secrets and variables → Actions:

| Secret | Used by | How to create |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | deploy-web, deploy-docs | Cloudflare dashboard → API Tokens → Custom. Permissions: Pages `Edit`, Workers `Edit` |
| `CONVEX_DEPLOY_KEY` | deploy-convex | Convex dashboard → Project → Settings → Deploy Keys → Generate Key |
| `NPM_TOKEN` | publish | npm → Access Tokens → Granular. Scope to `@bazileros/payfast` with Read and write |

Full step-by-step instructions in [SECRETS.md](./SECRETS.md).

## How to publish a new version

```bash
# 1. Bump version in packages/payfast/package.json
#    (semver: breaking=minor, feature=minor, fix=patch)

# 2. Commit and push
git add packages/payfast/package.json
git commit -m "bump version to 0.x.y"
git push origin main

# 3. Tag and push the tag
git tag v0.x.y
git push origin v0.x.y

# 4. Watch the publish workflow at
#    https://github.com/bazileros/payfastt/actions
```

The tag must start with `v` (e.g. `v0.2.0`). The workflow:
1. Runs the full test suite (lint + typecheck + test)
2. Builds the package
3. Runs `npm publish --provenance --access public`

The `--provenance` flag signs the package with GitHub's OIDC token, proving it was built by your CI pipeline.

## Architecture notes

- **test.yml is reusable** — called as a job by deploy workflows via `uses: ./.github/workflows/test.yml`. This ensures every deploy is gated on green tests.
- **Parallel deploys** — web, docs, and Convex deploy in parallel after a single test run. If one fails, the others still succeed.
- **Convex deploy** requires `packages/payfast` to be built first (handled in the workflow).
- **Docs deploy** uses the auto-generated `wrangler.json` from Astro's Cloudflare adapter. The build outputs `dist/client` (static assets) and `dist/server` (worker entry + config).
- **No preview deployments** — Cloudflare Pages supports PR previews if you add the integration later.

## Deploying the docs site locally

```bash
cd apps/docs
bun run build
npx wrangler deploy --config dist/server/wrangler.json
```

## Deploying the Convex backend locally

```bash
npx convex deploy
```

Ensure environment variables are set:

```bash
npx convex env set PAYFAST_MERCHANT_ID    your_id
npx convex env set PAYFAST_MERCHANT_KEY   your_key
npx convex env set PAYFAST_PASSPHRASE     your_passphrase
npx convex env set PAYFAST_SANDBOX        true
```
