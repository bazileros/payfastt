![PayFast](Payfast-logo.svg)

# @bazileros/payfast — PayFast Convex Component

PayFast payment gateway integration for Convex apps. One-time payments (Custom Integration form redirect), recurring billing, tokenized charges, refunds, and ITN webhook processing.

## Setup

```bash
npm install @bazileros/payfast
```

### 1. Register the component

`convex.config.ts`:

```ts
import { defineApp } from "convex/server";
import payfast from "@bazileros/payfast/convex.config";

const app = defineApp();
app.use(payfast);
export default app;
```

Set env vars at deploy prompt:

| Variable | Required | Description |
|---|---|---|
| `PAYFAST_MERCHANT_ID` | Yes | PayFast merchant ID |
| `PAYFAST_MERCHANT_KEY` | Yes | PayFast merchant key |
| `PAYFAST_PASSPHRASE` | Yes | PayFast passphrase |
| `PAYFAST_SANDBOX` | No | Set `"true"` for sandbox |

### 2. Mount ITN webhook

`convex/http.ts`:

```ts
import { httpRouter } from "convex/server";
import { registerRoutes } from "@bazileros/payfast/http";
import { components } from "./_generated/api";

const http = httpRouter();
registerRoutes(http, components.payfast, {
  events: {
    onPaymentComplete: (ctx, event) => {
      // grant access, send email, etc.
    },
  },
});
export default http;
```

Configure PayFast to send ITNs to `https://<your-deployment>.convex.site/payfast/itn`.

### 3. Use React hooks

```tsx
import { usePayfastCheckout, useTransactions, useSubscriptions } from "@bazileros/payfast/react";
import { components } from "../convex/_generated/api";
```

## Usage

### One-time payment

```tsx
function DonateButton() {
  const { formRef, submit } = usePayfastCheckout(components.payfast, {
    amount: 100,
    itemName: "Donation",
  });
  return <button onClick={submit}>Donate R100</button>;
}
```

### Payment method

Restrict which payment methods the buyer sees:

```tsx
usePayfastCheckout(components.payfast, {
  amount: 100,
  itemName: "Widget",
  paymentMethod: "cc",           // card only
  // paymentMethod: "dc",        // Discovery card
  // paymentMethod: "mt",        // mobile money
  // paymentMethod: "ew",        // e-wallet
  // paymentMethod: "sc",        // store cash
});
```

Value: `cc` | `dc` | `mt` | `mp` | `sc` | `ew` | `av`

### Split payments

Split a transaction across multiple receivers (marketplaces, platform fees):

```tsx
import type { SplitPaymentOptions } from "@bazileros/payfast";

usePayfastCheckout(components.payfast, {
  amount: 100,
  itemName: "Marketplace sale",
  setup: JSON.stringify({
    split_payments: [
      { merchant_id: "10000123", percentage: 90 },
      { merchant_id: "10000456", percentage: 10 },
    ] satisfies SplitPaymentOptions,
  }),
});
```

Or pass raw JSON for custom PayFast fields:

```tsx
usePayfastCheckout(components.payfast, {
  amount: 100,
  itemName: "Widget",
  setup: JSON.stringify({ split_token: "tok_abc123" }),
});
```

### Onsite payments

Hosted iframe widget — buyer enters card details on your site:

```tsx
import { usePayfastOnsite } from "@bazileros/payfast/react";

const { generateOnsite, paymentIdentifier } = usePayfastOnsite(components.payfast, {
  amount: 100,
  itemName: "Widget",
  returnUrl: "https://mysite.com/success",
  cancelUrl: "https://mysite.com/cancel",
});
// Pass paymentIdentifier to PayFast engine.js
```

### List transactions

```tsx
function TransactionList() {
  const transactions = useTransactions(components.payfast, { limit: 10 });
  return <pre>{JSON.stringify(transactions, null, 2)}</pre>;
}
```

### Subscription management

```tsx
function SubscriptionActions({ token }: { token: string }) {
  const { pause, unpause, cancel } = useSubscriptionActions(components.payfast, token);
  return (
    <>
      <button onClick={pause}>Pause</button>
      <button onClick={unpause}>Resume</button>
      <button onClick={cancel}>Cancel</button>
    </>
  );
}
```

### Server-side (Payfast class)

```ts
import { Payfast } from "@bazileros/payfast";
import { components } from "../_generated/api";

const pf = new Payfast({ sandbox: true, getUserInfo: () => userId });

// In a Convex action:
const form = await ctx.runAction(components.payfast.lib.generateCheckoutForm, {
  amount: 100, itemName: "Widget", userId: user._id,
});
```

### Typed wrapper methods

```ts
const pf = new Payfast({ sandbox: true, getUserInfo: () => currentUserId });

const txs = await pf.listTransactions(ctx);
const subs = await pf.listSubscriptions(ctx);
await pf.cancelSubscription(ctx, sub.token);
```

## Agent / AI Support

A `SKILL.md` ships with the package for AI agent discoverability:

```bash
# Discover and install via skills.sh:
skills add bazileros/payfastt -a '*'

# Or once registered in vercel-labs/agent-skills:
skills add vercel-labs/agent-skills -s bazileros-payfast
```

Supported agents: Claude Code, Cursor, opencode, Cline, Windsurf, Copilot, and 30+ more (any agent compatible with skills.sh).

No postinstall/preinstall scripts. Dependency model: convex as dep + peer (same `^1.36.1` range), react as peer-only.

## Architecture

- **Component functions** (`src/component/functions/lib.ts`) — Convex queries/mutations/actions for transactions, subscriptions, checkout form generation
- **HTTP handler** (`src/component/functions/http.ts`) — ITN webhook with echo-back validation + signature check
- **Client class** (`src/client/index.ts`) — `Payfast` class with typed wrapper methods, `registerRoutes` helper, `ItnEventHandlers`
- **React hooks** (`src/react/index.ts`) — Thin wrappers over `useQuery`, `useMutation`, `useAction`

Env vars via `ctx.env.*` (typesafe Convex component config — no `process.env`).
