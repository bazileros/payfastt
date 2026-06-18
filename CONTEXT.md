# @bazileros/payfast — Domain Glossary

## Project

A PayFast payment gateway Convex component, ported into the payfastt Turbo monorepo as an internal
package (`@bazileros/payfast` at `packages/payfast/`). Provides one-time payments, recurring billing,
tokenized charges, refunds, and ITN webhook processing with owned Convex tables and a typed client API.

## Monorepo Layout

```
packages/payfast/
├── src/
│   ├── client/          # Payfast class + registerRoutes helper
│   ├── component/       # Convex component: schema, lib, http, md5, statuses
│   └── react/           # React hooks (usePayfastCheckout, useTransactions, etc.)
├── convex.json          # Points convex CLI to component source
├── package.json         # @bazileros/payfast, private, typed exports
├── tsconfig.json        # Extends @payfastt/config/tsconfig.base.json
└── vitest.config.ts     # Edge-runtime test environment
```

## Glossary

**App User** — A person using the app that embeds this component. Identified by the app's own user ID
(plain string, stored as `userId` in the component's tables). Not a PayFast concept.

**User Profile** — A record in the `userProfiles` table storing metadata about an App User (email, name,
arbitrary metadata). Purely local to the component — PayFast has no customer API, so this is just
convenient storage for the app.

**PayFast** — South African payment gateway. Supports Custom Integration (form redirect) and REST API
(server-to-server) modes.

**Custom Integration** — PayFast integration mode where the merchant generates a signed HTML form; the
buyer POSTs to PayFast, is redirected to PayFast's site, then returned to the merchant's return/cancel
URL. PCI-compliant by design. Used for one-time payments.

**REST API** — PayFast's server-to-server API for subscriptions, tokenized charges, refunds, and
subscription management. Uses a different signing algorithm from Custom Integration (sorted headers +
body fields, no `&passphrase=` suffix).

**ITN (Instant Transaction Notification)** — Asynchronous webhook sent by PayFast to the merchant's
notify URL after a transaction event. Must be echo-back-validated to confirm authenticity.

**Echo-back validation** — The ITN receiver POSTs the raw ITN payload back to PayFast's validate
endpoint. Returns `VALID` or `INVALID`. Only `VALID` responses are trusted.

**Token** — PayFast's opaque identifier for a recurring billing subscription. There is no standalone
card token in PayFast — every token is a subscription token. Tokenized charges
(`chargeSubscriptionAdhoc`) are ad-hoc charges against an existing subscription's token.

**Subscription Status** — The component tracks PayFast's remote subscription state locally. Valid
statuses: `active`, `paused`, `cancelled`, `completed`, `suspended`, `expired`.

**Signature** — MD5 hash used to verify request authenticity. Two algorithms:
- **Custom Integration**: fields sorted alphabetically, joined as `key=value` pairs, `&passphrase=`
  appended, then MD5-hashed.
- **REST API**: body fields + passphrase merged with headers, sorted alphabetically, joined as
  `key=val` pairs, MD5-hashed without `&passphrase=` suffix.

**Sandbox** — PayFast's test environment (`sandbox.payfast.co.za`). Same API surface as production.

## Design Decisions

### Environment variables: `ctx.env` via Convex component config (2026-06-18)

All PayFast credentials are declared in `convex.config.ts`'s `env` block with Zod-style validators:

```ts
export default defineComponent({
  name: "payfast",
  env: {
    PAYFAST_MERCHANT_ID: v.string(),
    PAYFAST_MERCHANT_KEY: v.string(),
    PAYFAST_PASSPHRASE: v.string(),
    PAYFAST_SANDBOX: v.optional(v.string()),
  },
});
```

Inside component functions, credentials are accessed via `ctx.env.PAYFAST_MERCHANT_ID` etc. —
typesafe, enforced at deployment time by `npx convex dev`. This replaces the old `payfastConfig()`
helper that read from `process.env`. The client-side `getCardUpdateUrl` method accepts `sandbox`
via the `Payfast` class constructor instead of falling back to `process.env`.

**Why:** Prevents silent checkout failures from a missing passphrase or malformed merchant ID.
Convex prompts the developer to input these vars on deploy and validates them at runtime.

### React hooks in `src/react/` (2026-06-18)

Unlike the upstream package (which removed hooks entirely), this port includes a React hooks package:

- `usePayfastCheckout(amount, itemName, opts?)` — generates checkout form + auto-submits
- `useTransactions(filters?)` — reactive transaction list via `useQuery`
- `useSubscriptions(filters?)` — reactive subscription list
- `useSubscriptionActions(token)` — pause, unpause, cancel, update

Hooks are thin wrappers over Convex's `useQuery`/`useMutation`/`useAction` that call
`components.payfast.lib.*` functions.

### Linting & formatting: Biome (2026-06-18)

The monorepo uses Biome for both linting and formatting — no eslint or prettier. The shared
`biome.json` covers the package. Custom eslint rules from the upstream package (e.g.
`@convex-dev/eslint-plugin`, `react-hooks`) are superseded by Biome's recommended ruleset plus
monorepo-specific style rules.

### Build pipeline: Turbo (2026-06-18)

The package uses `tsc` for TypeScript compilation (same as upstream). Build ordering:

1. `convex codegen --component-dir ./src/component` — generates `_generated/` files (schema → API)
2. `tsc --project tsconfig.build.json` — compiles to `dist/`

Step 1 is a one-time/schema-change step, not part of every build. The `build:codegen` script
combines both. `turbo.json` ensures `packages/payfast` builds before `packages/backend` starts.

### Private package (2026-06-18)

`@bazileros/payfast` is `"private": true` — not published to npm. It's consumed internally via
`workspace:*` dependencies. PUBLISHING.md from the upstream package is not included.

## Upstream Source

The upstream package at `~/projects/payfast` (published as `@convex-dev/payfast`) is the source
of truth for the component logic. Key differences from the port:

| Aspect | Upstream (source) | This port |
|---|---|---|
| Repo | Standalone npm package | Turbo monorepo package |
| Env vars | `process.env` | `ctx.env` (Convex typesafe) |
| Linting | eslint + prettier | Biome |
| Build | chokidar watch + tsc | Turbo pipeline + tsc |
| React hooks | Removed (empty dir) | Included (`src/react/`) |
| Example app | Standalone Vite app | `apps/web` pages |
| Package scope | `@convex-dev/payfast` | `@bazileros/payfast` |
| Visibility | Public npm | Private workspace |
| Tsconfig | Standalone | Extends `@payfastt/config/tsconfig.base.json` |
