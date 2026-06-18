# PRD: Port `@bazileros/payfast` into Turbo Monorepo

**Status:** Final · **Owner:** @zalisile · **Last Updated:** 2026-06-18

---

## Press Release

**Headline:** PayFast Payments, Now Native in the payfastt Stack — Ship SA Payment Flows in Minutes, Not Days

The payfastt monorepo now ships with a first-class PayFast payment component. From today, developers working on this stack can add South African payment processing — one-time payments, subscriptions, tokenized charges, and refunds — without leaving the repo. No npm linking, no copy-pasting from a separate package, no hand-rolling MD5 signatures.

`@bazileros/payfast` lives at `packages/payfast/`, shares the repo's TypeScript configs, Biome linting, and Turbo build pipeline. It exposes typed Convex functions for checkout form generation, subscription CRUD, ITN webhook processing, and transaction queries — plus a React hooks package for the frontend. The env vars are typesafe via Convex's `ctx.env` pattern, so a missing passphrase or malformed merchant ID is caught at deployment time, not during a customer's payment.

## Problem & Context

The payfastt monorepo at `~/projects/payfastt` has two disconnected pieces:
- A Turbo monorepo with `apps/web` (frontend), `packages/backend` (Convex), `packages/ui` (components), etc.
- A standalone PayFast Convex component at `~/projects/payfast` (published as `@convex-dev/payfast`)

They need to be one. The backend has no payment processing, the frontend has no checkout flows. Every PayFast feature requires jumping between repos, npm linking, or duplicating code. Meanwhile the standalone component has matured — schema, ITN handling, subscription lifecycle, test coverage — but it's locked in its own repo with its own build (eslint, prettier, separate tsconfig, chokidar watch).

**Why this matters now:** Payment processing is the core product feature. Without it the app cannot accept payments. Porting the component into the monorepo is the prerequisite for building the checkout and billing flows in `apps/web`.

## Success Criteria

| Criterion | How to verify |
|---|---|
| Package compiles | `turbo build -F @bazileros/payfast` exits 0 |
| Backend registers component | `convex dev` picks up `@bazileros/payfast/convex.config` |
| ITN webhook mountable | `registerRoutes()` callable from `packages/backend/convex/http.ts` |
| Typesafe env vars | `ctx.env.PAYFAST_MERCHANT_ID` type-checks as `string` |
| Client class works | `new Payfast(components.payfast)` type-checks |
| React hooks export | `usePayfastCheckout`, `useSubscription` type-check and are usable from `apps/web` |
| Tests pass | `vitest run` in `packages/payfast` exits 0 |
| Biome passes | `bun run check` exits 0 with no payfast violations |
| TypeScript strict | `tsc --noEmit` in `packages/payfast` exits 0 |
| Example pages work | `apps/web` has working checkout and transaction list pages |

## Customer Definition

**Primary:** Developers on the payfastt team building payment flows.  
**Secondary:** Future contributors maintaining or extending the PayFast integration.

**Life after shipping:** A dev adds checkout by creating a wrapper mutation that calls `components.payfast.lib.generateCheckoutForm`, then renders the form in a React component using `usePayfastCheckout`. The ITN webhook is wired once in `convex/http.ts`. Subscription management uses the `Payfast` client class. No npm linking, no copy-paste, no schema drift.

## Feature Scope

### v1.0 — "Port & integrate" (in scope)

**Package infrastructure**
- `packages/payfast/` with shared tsconfig, Biome, Turbo build pipeline
- `convex.config.ts` with `env` declaration for typesafe credentials
- Package exports: `.`, `./convex.config`, `./http`, `./_generated/component`
- Build pipeline: codegen → tsc → convex dev, wired into `turbo.json`

**PayFast payment operations**
- Checkout form generation (`generateCheckoutForm` query)
- Subscription CRUD (create, pause, unpause, cancel, update) via REST API
- Tokenized ad-hoc charges (`chargeSubscriptionAdhoc`)
- Full and partial refunds (`processRefund`)
- Transaction and subscription queries (list by user/status, get by ID)
- User profile management (local metadata, no PayFast customer API)

**ITN webhook processing**
- Signature verification against `ctx.env.PAYFAST_PASSPHRASE`
- Echo-back validation to PayFast
- Auto-sync transaction status to `transactions` table
- Auto-create subscriptions from ITN payload when token is unknown
- Full ITN logging to `itnLog` table (raw payload, status, errors)

**React integration**
- `usePayfastCheckout(amount, itemName, opts?)` — generates form + auto-submits
- `useTransactions(filters?)` — reactive transaction list
- `useSubscriptions(filters?)` — reactive subscription list
- `useSubscriptionActions(token)` — pause, unpause, cancel, update

**Backend wiring**
- Register component in `convex.config.ts` via `app.use(payfast)`
- Mount ITN webhook in `convex/http.ts` via `registerRoutes`

**Documentation**
- `packages/payfast/README.md` — setup, env vars, API reference, examples
- `apps/fumadocs` — user-facing usage guides

### Explicitly out of scope (v1)

- Publishing `@bazileros/payfast` to npm (private package)
- Split payments (PayFast feature, low usage)
- Onsite payments (modal/iframe integration, requires client-side JS)
- Admin dashboard UI (the component is backend-only)
- CI/CD pipeline changes (covered by existing turbo config)

## Key Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Package name | `@bazileros/payfast` | Matches GitHub org, distinct from upstream `@convex-dev/payfast` |
| Env var pattern | `ctx.env` via Convex `env` declaration | Typesafe, enforced at deployment time, prevents silent failures |
| Linting | Biome (monorepo standard) | Replaces eslint + prettier; single tool for lint + format |
| Build tool | tsc (same as source) | Produces `dist/` with declarations; fits Turbo's `outputs` model |
| Codegen ordering | `build:codegen` script | convex codegen → tsc build; run manually when schema changes |
| HTTP routes | `registerRoutes()` in backend's `http.ts` | Follows Convex component best practices |
| React hooks | New `src/react/` directory | Matches user request; consistent with `@convex-dev/stripe` patterns |
| Package visibility | `"private": true` | Internal only; not published to npm |
| MD5 implementation | Keep custom `md5.ts` | Works in all runtimes (Convex, edge-runtime tests, browser) |
| Class-based client | Keep `Payfast` class | Stripe-like DX; `getCardUpdateUrl` accepts `sandbox` via constructor |

## Technical Architecture

```
payfastt/
├── apps/
│   └── web/                          # React + TanStack Router frontend
│       └── src/routes/payfast/       # Checkout, subscriptions, transactions pages
│
├── packages/
│   ├── backend/
│   │   └── convex/
│   │       ├── convex.config.ts       # app.use(payfast)
│   │       ├── http.ts               # registerRoutes
│   │       └── _generated/api        # Generated Convex API
│   │
│   └── payfast/                       # @bazileros/payfast
│       ├── src/
│       │   ├── client/
│       │   │   └── index.ts           # Payfast class + registerRoutes
│       │   ├── component/
│       │   │   ├── convex.config.ts   # defineComponent with env declaration
│       │   │   ├── schema.ts          # 4 owned tables
│       │   │   ├── lib.ts             # All queries, mutations, actions
│       │   │   ├── http.ts            # Component-level ITN handler
│       │   │   ├── md5.ts             # Pure MD5 for signatures
│       │   │   └── statuses.ts        # Status constants + type guards
│       │   └── react/
│       │       └── index.ts           # React hooks
│       ├── convex.json
│       ├── package.json               # Exports: ., ./convex.config, ./http, ./_generated/component
│       ├── tsconfig.json              # Extends @payfastt/config/tsconfig.base.json
│       └── vitest.config.ts
│
│   └── config/
│       └── tsconfig.base.json         # Shared strict TS config
│
└── turbo.json                         # Build pipeline: payfast → backend
```

**Data flow:**
1. **Checkout:** App mutation calls `components.payfast.lib.generateCheckoutForm` → returns signed form fields → frontend renders hidden form → user POSTs to PayFast
2. **ITN Webhook:** PayFast POSTs to `/payfast/itn` → `registerRoutes` handler calls `handleItn` action → validates signature + echo-back → updates `transactions`/`subscriptions` tables → logs to `itnLog`
3. **Subscriptions:** App action calls `components.payfast.lib.subscribe` → component signs request with `ctx.env` credentials → PayFast REST API → stores token locally
4. **Queries:** React hooks call `useQuery(components.payfast.lib.listTransactions)` → reactive subscription to Convex DB

**Security:**
- Merchant credentials via `ctx.env` — typesafe, never exposed to client
- ITN validated by echo-back + signature verification (two independent checks)
- Auth/ID mapping stays in app layer — component receives `userId` as string, never accesses app auth
- No `process.env` in component code — all env access through typed `ctx.env`

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| `ctx.env` not available in component http actions | Low | High | Verify Convex version supports it; fallback to process.env if needed |
| Env var name conflict with other packages | Low | Low | Prefix with `PAYFAST_` — already scoped |
| Convex codegen + tsc build ordering | Medium | Medium | Separate `build:codegen` script; document manual step |
| ITN delivery failures | Medium | High | Log raw payloads to `itnLog`; provide re-process tool |
| Signature generation bugs | Low | Critical | Comprehensive unit tests with known PayFast reference values |

## Open Items

- [ ] Verify `ctx.env` is available in component `httpAction` handlers (Convex version check)
- [ ] Confirm `fumadocs` setup for the docs app (may need additional config)

## Appendix: PayFast API Surface

| Endpoint | Method | Purpose |
|---|---|---|
| `POST /eng/process` | Form POST | Custom Integration redirect |
| `POST /api/subscriptions` | POST | Create subscription |
| `PATCH /api/subscriptions/{token}/pause` | PATCH | Pause subscription |
| `PATCH /api/subscriptions/{token}/unpause` | PATCH | Unpause subscription |
| `PATCH /api/subscriptions/{token}/cancel` | PATCH | Cancel subscription |
| `PATCH /api/subscriptions/update/{token}` | PATCH | Update subscription |
| `POST /api/subscriptions/{token}/adhoc` | POST | Ad-hoc charge |
| `GET /api/subscriptions/{token}/fetch` | GET | Fetch subscription |
| `POST /api/transactions/{pfPaymentId}/refund` | POST | Refund |
| `POST /eng/query/validate` | POST | ITN echo-back validation |
