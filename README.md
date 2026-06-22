<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/payfastt-%23000000?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMjAgM2wxNyAxMGwtMTcgMTAtMTctMTB6TTMgMjBsMTcgMTAgMTctMTB6Ii8+PC9zdmc+">
    <img alt="payfastt" src="https://img.shields.io/badge/payfastt-%23000000?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48cGF0aCBmaWxsPSIjMDAwIiBkPSJNMjAgM2wxNyAxMGwtMTcgMTAtMTctMTB6TTMgMjBsMTcgMTAgMTctMTB6Ii8+PC9zdmc+" width="200">
  </picture>
</p>

<h1 align="center">payfastt</h1>

<p align="center">
  <strong>PayFast payments for Convex apps</strong>
</p>

<p align="center">
  <a href="#features">Features</a> ·
  <a href="#quick-start">Quick Start</a> ·
  <a href="#docs">Docs</a> ·
  <a href="#project-structure">Structure</a>
</p>

<br>

<p align="center">
  <a href="https://www.npmjs.com/package/@bazileros/payfast">
    <img src="https://img.shields.io/npm/v/@bazileros/payfast?style=flat-square&logo=npm&label=package" alt="npm">
  </a>
  <a href="https://www.npmjs.com/package/@bazileros/payfast">
    <img src="https://img.shields.io/npm/l/@bazileros/payfast?style=flat-square" alt="license">
  </a>
  <a href="https://www.typescriptlang.org">
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
  </a>
  <a href="https://turbo.build/repo">
    <img src="https://img.shields.io/badge/Turborepo-EF4444?style=flat-square&logo=turborepo&logoColor=white" alt="Turborepo">
  </a>
  <a href="https://convex.dev">
    <img src="https://img.shields.io/badge/Convex-0D1821?style=flat-square&logo=convex&logoColor=white" alt="Convex">
  </a>
  <br>
  <a href="https://bun.sh">
    <img src="https://img.shields.io/badge/Bun-000?style=flat-square&logo=bun&logoColor=white" alt="Bun">
  </a>
  <a href="https://biomejs.dev">
    <img src="https://img.shields.io/badge/Biome-60A5FA?style=flat-square&logo=biome&logoColor=white" alt="Biome">
  </a>
  <a href="https://payfastt.dev/docs">
    <img src="https://img.shields.io/badge/docs-starlight-8B5CF6?style=flat-square" alt="docs">
  </a>
</p>

---

## Features

**@bazileros/payfast** is a [Convex](https://convex.dev) component that integrates the [PayFast](https://www.payfast.co.za) payment gateway into your Convex application. Drop it in with `app.use(payfast)` and start accepting payments.

- **One-time payments** via PayFast Custom Integration (signed form redirect — PCI-compliant)
- **Recurring billing** — create, pause, unpause, cancel, and update subscriptions
- **Tokenized charges** — ad-hoc charges against existing subscription tokens
- **Refunds** — full and partial via PayFast REST API
- **Onsite payments** — hosted iframe widget via `POST /onsite/process`
- **Transaction history** — query PayFast transaction records
- **Stored credit cards** — query saved cards via REST API
- **ITN webhook** — echo-back-validated + source IP checked + signature verified
- **React hooks** — `usePayfastCheckout`, `useTransactions`, `useSubscriptions`, `useSubscriptionActions`, `usePayfastOnsite`, `useAdhocCharge`, `useRefund`
- **Context provider** — `PayfastProvider` eliminates passing `components.payfast` to every hook
- **Sandbox mode** — toggle via `PAYFAST_SANDBOX` env var
- **Type-safe** — full TypeScript types for requests, responses, and webhook events

## Quick Start

```bash
npm install @bazileros/payfast
```

### 1. Register the component

```ts
// convex/convex.config.ts
import { defineApp } from "convex/server";
import payfast from "@bazileros/payfast/convex.config";

const app = defineApp();
app.use(payfast);
export default app;
```

### 2. Set environment variables

```bash
npx convex env set PAYFAST_MERCHANT_ID    your_merchant_id
npx convex env set PAYFAST_MERCHANT_KEY   your_merchant_key
npx convex env set PAYFAST_PASSPHRASE     your_passphrase
npx convex env set PAYFAST_SANDBOX        true
```

### 3. Mount the ITN webhook

```ts
// convex/http.ts
import { httpRouter } from "convex/server";
import { registerRoutes } from "@bazileros/payfast/http";
import { components } from "./_generated/api";

const http = httpRouter();
registerRoutes(http, components.payfast);
export default http;
```

### 4. Use it

```tsx
import { PayfastProvider, usePayfastCheckout } from "@bazileros/payfast/react";
import { components } from "../convex/_generated/api";

function Root() {
  return (
    <PayfastProvider component={components.payfast}>
      <DonateButton />
    </PayfastProvider>
  );
}

function DonateButton() {
  const { generateCheckout, loading } = usePayfastCheckout({
    amount: 100,
    itemName: "Donation",
  });
  return <button onClick={generateCheckout} disabled={loading}>Donate R100</button>;
}
```

See the full [documentation →](https://payfastt.dev/docs)

## Project Structure

```
payfastt/
├── packages/
│   ├── payfast/          # @bazileros/payfast — the Convex component
│   │   ├── src/
│   │   │   ├── client/   # Payfast class + registerRoutes helper
│   │   │   ├── component/  # Component config + types
│   │   │   │   └── functions/  # Queries, mutations, actions, schema, HTTP routes
│   │   │   └── react/    # React hooks
│   │   └── SKILL.md      # AI agent skill file (skills.sh compatible)
│   ├── backend/          # Example Convex backend using the component
│   ├── ui/               # Shared shadcn/ui primitives
│   └── infra/            # Deployment (Cloudflare Workers via Alchemy)
├── apps/
│   ├── web/              # Example TanStack Router SPA
│   └── docs/             # Documentation site (Astro Starlight)
└── .github/
    └── workflows/        # CI/CD: test, deploy, publish
```

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start all apps in development mode |
| `bun run build` | Build all packages and apps |
| `bun run bootstrap` | First-time setup (codegen + build) |
| `bun run check` | Biome lint + format check |
| `bun run check-types` | TypeScript type check all packages |

## Agent / AI Support

A `SKILL.md` ships with the npm package for AI agent discoverability. Compatible with Claude Code, Cursor, opencode, Cline, Windsurf, and 30+ other agents via [skills.sh](https://skills.sh).

## License

Apache 2.0 — see [LICENSE](LICENSE).
