---
name: bazileros-payfast
description: PayFast payment gateway Convex component — one-time payments, subscriptions, tokenized charges, refunds, and ITN webhooks. Use when the user mentions PayFast, @bazileros/payfast, or needs to accept payments via PayFast in a Convex app.
---

# @bazileros/payfast — PayFast Convex Component

Integrates [PayFast](https://www.payfast.co.za) (South African payment gateway) into a Convex app. Supports Custom Integration (form redirect), Onsite (iframe widget), REST API (subscriptions, tokenized charges, refunds, queries), and ITN webhook processing.

## Install

```bash
npm install @bazileros/payfast
```

## Setup

### 1. Register the component

In your backend's `convex.config.ts`:

```ts
import { defineApp } from "convex/server";
import payfast from "@bazileros/payfast/convex.config";

const app = defineApp();
app.use(payfast);
export default app;
```

### 2. Set environment variables

Deployment prompts you to set these (via `npx convex env set` or the Convex dashboard):

| Variable | Required | Description |
|---|---|---|
| `PAYFAST_MERCHANT_ID` | Yes | PayFast merchant ID |
| `PAYFAST_MERCHANT_KEY` | Yes | PayFast merchant key |
| `PAYFAST_PASSPHRASE` | Yes | PayFast passphrase |
| `PAYFAST_SANDBOX` | No | Set `"true"` for sandbox |

### 3. Mount the ITN webhook

In your backend's `convex/http.ts`:

```ts
import { httpRouter } from "convex/server";
import { components } from "./_generated/api";
import { registerRoutes } from "@bazileros/payfast/http";

const http = httpRouter();
registerRoutes(http, components.payfast, {
  events: {
    onPaymentComplete: (ctx, pfData) => {
      // grant access, send email, etc.
    },
  },
});
export default http;
```

### 4. Use in React — two patterns

**Explicit component (traditional):**

```tsx
import { usePayfastCheckout } from "@bazileros/payfast/react";
import { components } from "../convex/_generated/api";

function DonateButton() {
  const { generateCheckout, formActionUrl, formFields, loading } =
    usePayfastCheckout(components.payfast, {
      amount: 100,
      itemName: "Donation",
    });

  return <button onClick={generateCheckout} disabled={loading}>Donate R100</button>;
}
```

**Context provider (recommended):**

```tsx
import { PayfastProvider } from "@bazileros/payfast/react";
import { components } from "../convex/_generated/api";

function Root() {
  return (
    <PayfastProvider component={components.payfast}>
      <App />
    </PayfastProvider>
  );
}

// Inside <App>, hooks omit the component arg:
function DonateButton() {
  const { generateCheckout, loading } = usePayfastCheckout({
    amount: 100,
    itemName: "Donation",
  });
  // ...
}
```

## Key API

### Server-side (inside Convex functions)

Generate a signed checkout form (mutation):

```ts
const form = await ctx.runMutation(components.payfast.lib.generateCheckoutForm, {
  amount: 100, itemName: "T-shirt", userId: "user_abc",
});
// { actionUrl, fields, signature, transactionId }
```

List transactions (query):

```ts
const txs = await ctx.runQuery(components.payfast.lib.listTransactions, {
  userId: "user_abc",
});
```

Manage subscriptions (actions — call PayFast REST API):

```ts
await ctx.runAction(components.payfast.lib.pauseSubscription, { token: "tok_123" });
await ctx.runAction(components.payfast.lib.unpauseSubscription, { token: "tok_123" });
await ctx.runAction(components.payfast.lib.cancelSubscription, { token: "tok_123" });
await ctx.runAction(components.payfast.lib.updateSubscription, {
  token: "tok_123", amount: 99, frequency: 1,
});
```

Ad-hoc charge (action):

```ts
await ctx.runAction(components.payfast.lib.chargeSubscriptionAdhoc, {
  token: "tok_123", amount: 5000, // cents
});
```

Refund (action):

```ts
await ctx.runAction(components.payfast.lib.refundTransaction, {
  ptxId: "ptx_abc123", amount: 50, // partial refund
});
```

Query PayFast transaction history / credit cards (actions):

```ts
const history = await ctx.runAction(components.payfast.lib.queryTransactions, { offset: 0 });
const cards = await ctx.runAction(components.payfast.lib.queryCreditCards, {});
```

Onsite payment identifier (action):

```ts
const { paymentIdentifier } = await ctx.runAction(
  components.payfast.lib.generateOnsitePaymentIdentifier,
  { amount: 100, itemName: "Donation", returnUrl: "...", cancelUrl: "..." },
);
```

### Client-side (Payfast class)

```ts
import { Payfast } from "@bazileros/payfast";
import { components } from "./_generated/api";

const pf = new Payfast(components.payfast, {
  sandbox: true,
  getUserInfo: async (ctx) => {
    const identity = await getAuthIdentity(ctx);
    return { userId: identity.subject };
  },
});

// Typed wrapper — calls component.lib.* via runAction/runQuery
const txs = await pf.listTransactions(ctx);
const subs = await pf.listSubscriptions(ctx);
await pf.pauseSubscription(ctx, { token: "tok_123" });
await pf.chargeAdhoc(ctx, { token: "tok_123", amount: 5000 });
await pf.refund(ctx, { ptxId: "ptx_abc123" });
```

### React hooks

```tsx
import {
  PayfastProvider,
  usePayfast,
  usePayfastCheckout,
  useTransactions,
  useTransaction,
  useSubscriptions,
  useSubscription,
  useSubscriptionActions,
  usePayfastOnsite,
  useAdhocCharge,
  useRefund,
} from "@bazileros/payfast/react";
```

All hooks support both explicit-component and context-based calling conventions.

## Important Notes

- **Tokens** in PayFast are subscription tokens, not standalone card tokens. Use `chargeSubscriptionAdhoc` for ad-hoc charges against an existing subscription.
- **ITN validation** is automatic in `registerRoutes` — source IP check + echo-back validation + signature verification. Only `VALID` responses are processed.
- **Subscription statuses**: `active` | `paused` | `cancelled` | `completed` | `suspended` | `expired`
- **Transaction statuses**: `COMPLETE` | `PENDING` | `PROCESSING` | `CANCELLED` | `OVERDUE` | `REFUNDED` | `UNKNOWN`
- **Not available in sandbox**: refunds, ad-hoc charges, onsite payments
- **No postinstall/preinstall scripts** — dependency model is clean (convex as dep + peer, react as peer-only)
- **Passphrase signing**: Custom Integration uses `&passphrase=` suffix; REST API uses sorted key=value with passphrase as a field (no suffix)
