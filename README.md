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
  <a href="#why">Why</a> ·
  <a href="#quick-start">Quick Start</a> ·
  <a href="#docs">Docs</a> ·
  <a href="#project-structure">Structure</a>
</p>

<br>

<p align="center">
  <a href="https://www.npmjs.com/package/@bazileros/payfast">
    <img src="https://img.shields.io/npm/v/@bazileros/payfast?style=flat-square&logo=npm&label=package" alt="npm">
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/github/license/bazileros/payfastt?style=flat-square" alt="license">
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
  <a href="https://payfastt-docs-zalisile.surestrat.workers.dev">
    <img src="https://img.shields.io/badge/docs-fumadocs-8B5CF6?style=flat-square" alt="docs">
  </a>
</p>

---

## Features

**@bazileros/payfast** is a [Convex](https://convex.dev) component that integrates the [PayFast](https://www.payfast.co.za) payment gateway into your Convex application. Drop it in with `app.use(payfast)` and start accepting payments.

- **One-time payments** via PayFast Custom Integration (signed form redirect — PCI-compliant)
- **Recurring billing** — create, pause, unpause, cancel, and update subscriptions
- **Tokenized charges** — ad-hoc charges against existing subscription tokens
- **Refunds** — full and partial via PayFast REST API
- **ITN webhook** — echo-back-validated Instant Transaction Notification processing with typed event handlers
- **React hooks** — `usePayfastCheckout`, `useTransactions`, `useSubscriptions`, and more
- **Sandbox mode** — toggle via constructor option; no env var gymnastics
- **Type-safe** — full TypeScript types for requests, responses, and webhook events

## Why

I built this because there wasn't a turnkey PayFast integration for Convex. The existing PayFast SDKs are Node-only or PHP, and wiring up signed forms, REST API calls, and ITN validation yourself is tedious and error-prone.

This component gives you:

- **A single dependency** — `npm install @bazileros/payfast`, register the component, mount the webhook
- **Typesafe env vars** — `ctx.env.PAYFAST_MERCHANT_ID` at deploy time, not `process.env.PAYFAST_MERCHANT_ID` silently missing at runtime
- **Works on Convex's edge runtime** — no Node.js APIs, no `crypto` polyfills
- **React hooks included** — no boilerplate for checkout forms, transaction lists, or subscription management

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
app.use(payfast, {
  env: {
    PAYFAST_MERCHANT_ID: { defaultValue: "your-id" },
    PAYFAST_MERCHANT_KEY: { defaultValue: "your-key" },
    PAYFAST_PASSPHRASE: { defaultValue: "your-passphrase" },
    PAYFAST_SANDBOX: { defaultValue: "true" },
  },
});
export default app;
```

### 2. Mount the ITN webhook

```ts
// convex/http.ts
import { httpRouter } from "convex/server";
import { registerRoutes } from "@bazileros/payfast/http";
import { components } from "./_generated/api";

const http = httpRouter();
registerRoutes(http, components.payfast);
export default http;
```

### 3. Use it

```tsx
import { usePayfastCheckout } from "@bazileros/payfast/react";
import { components } from "../convex/_generated/api";

function Donate() {
  const { submit } = usePayfastCheckout(components.payfast, {
    amount: 100,
    itemName: "Donation",
  });
  return <button onClick={submit}>Donate R100</button>;
}
```

See the full [documentation →](https://payfastt-docs-zalisile.surestrat.workers.dev)

## Project Structure

```
payfastt/
├── packages/
│   ├── payfast/          # @bazileros/payfast — the Convex component
│   │   ├── src/
│   │   │   ├── client/   # Payfast class + registerRoutes helper
│   │   │   ├── component/# Convex component functions (queries, mutations, actions, HTTP)
│   │   │   └── react/    # React hooks
│   │   └── README.md
│   ├── backend/          # Example Convex backend using the component
│   ├── ui/               # Shared shadcn/ui primitives
│   └── infra/            # Deployment (Cloudflare Workers via Alchemy)
├── apps/
│   ├── web/              # Example TanStack Router SPA
│   └── fumadocs/         # Documentation site
└── .github/
    └── workflows/        # CI/CD: test, publish, deploy
```

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start all apps in development mode |
| `bun run build` | Build all packages and apps |
| `bun run bootstrap` | First-time setup (codegen + build) |
| `bun run check` | Biome lint + format check |

## Agent / AI Support

A `SKILL.md` ships with the npm package for AI agent discoverability. Compatible with Claude Code, Cursor, opencode, Cline, Windsurf, and 30+ other agents via [skills.sh](https://skills.sh).

## License

MIT — see [LICENSE](LICENSE).
