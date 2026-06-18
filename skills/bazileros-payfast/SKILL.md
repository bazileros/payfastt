---
name: bazileros-payfast
description: PayFast payment gateway Convex component — one-time payments, subscriptions, tokenized charges, refunds, and ITN webhooks. Use when the user mentions PayFast, @bazileros/payfast, or needs to accept payments via PayFast in a Convex app.
---

# @bazileros/payfast — PayFast Convex Component

Integrates [PayFast](https://www.payfast.co.za) (South African payment gateway) into a Convex app. Supports Custom Integration (form redirect), REST API (subscriptions, tokenized charges, refunds), and ITN webhook processing.

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

At deployment, Convex prompts you to set:

| Variable | Required | Description |
|---|---|---|
| `PAYFAST_MERCHANT_ID` | Yes | PayFast merchant ID |
| `PAYFAST_MERCHANT_KEY` | Yes | PayFast merchant key |
| `PAYFAST_PASSPHRASE` | Yes | PayFast passphrase |
| `PAYFAST_SANDBOX` | No | Set `"true"` for sandbox |

Sandbox mode can also be toggled per-checkout via the `Payfast` class constructor.

### 3. Mount the ITN webhook

In your backend's `convex/http.ts`:

```ts
import { httpRouter } from "convex/server";
import { components } from "./_generated/api";
import { registerRoutes } from "@bazileros/payfast/http";

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

### 4. Watch transactions (React)

```tsx
import { usePayfastCheckout } from "@bazileros/payfast/react";
import { components } from "../convex/_generated/api";

function DonateButton() {
  const { formRef, submit } = usePayfastCheckout(components.payfast, {
    amount: 100,
    itemName: "Donation",
  });
  return <button onClick={submit}>Donate R100</button>;
}
```

## Key API

### Server-side (inside Convex functions)

Call via `components.payfast.lib.*`:

```ts
import { components } from "./_generated/api";

// Generate a signed checkout form
const form = await ctx.runAction(components.payfast.lib.generateCheckoutForm, {
  amount: 100, itemName: "T-shirt", userId: user._id,
});

// List user's transactions
const txs = await ctx.runQuery(components.payfast.lib.listTransactions, { userId: user._id });

// Subscribe
const sub = await ctx.runMutation(components.payfast.lib.createSubscription, {
  amount: 50, itemName: "Monthly", frequency: "Monthly", cycles: 12, userId: user._id,
});

// Manage subscription
await ctx.runAction(components.payfast.lib.cancelSubscription, { token: sub.token });
await ctx.runAction(components.payfast.lib.pauseSubscription, { token: sub.token });
```

### Client-side (Payfast class)

```ts
import { Payfast } from "@bazileros/payfast";

const pf = new Payfast({ sandbox: true, getUserInfo: () => userId });

// Typed wrapper — calls component.lib.* via runAction/runQuery
const txs = await pf.listTransactions(ctx);
const subs = await pf.listSubscriptions(ctx);
```

## Important Notes

- **Tokens** in PayFast are subscription tokens, not standalone card tokens. Use `chargeSubscriptionAdhoc` for ad-hoc charges against an existing subscription.
- **ITN validation** is automatic in `registerRoutes` — echoes back and checks signature. Only `VALID` responses are processed.
- **Subscription statuses**: `active` | `paused` | `cancelled` | `completed` | `suspended` | `expired`
- **No postinstall/preinstall scripts** — dependency model is clean (convex as dep + peer, react as peer-only).
