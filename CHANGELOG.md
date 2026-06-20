# Changelog

## 0.2.0 (2026-06-20)

### Features

- **PayFast Convex component** — one-time payments (Custom Integration), subscriptions, tokenized charges, refunds, ITN webhooks with echo-back validation
- **Onsite payments** — hosted iframe widget via `POST /onsite/process`
- **REST API** — subscription management, ad-hoc charges, refunds, transaction history, credit card queries
- **Split payments** — multi-receiver payouts via JSON-encoded `setup` field and typed `SplitPaymentOptions`
- **React hooks** — `usePayfastCheckout`, `useTransactions`, `useSubscriptions`, `useSubscriptionActions`, `useAdhocCharge`, `useRefund`, `usePayfastOnsite`
- **React context** — `<PayfastProvider>` for hook calls without explicit component argument
- **ITN IP validation** — source IP check against PayFast's published whitelist (opt-out via `skipIpCheck`)
- **`callPayfastApi` helper** — centralised REST API URL construction, header signing, and error handling
- **TypeScript overloads** — every hook supports both explicit-component and context-based calling conventions

### Docs

- **Starlight documentation site** deployed to Cloudflare Workers at `/docs`
- **One Dark / One Light theme** with JetBrains Mono and Inter font stack
- **Landing page** — animated hero, BentoGrid (14 cards), FAQ accordion
- **5 framework guides** — Next.js App Router, Vite + React, TanStack Router, TanStack Start, React Native/Expo
- **Content pages** — Installation, Checkout, Subscriptions, ITN Webhooks, Split Payments, React Hooks, Server-side API, Best Practices
- **Custom components** — animated Hero, BentoGrid, FAQ accordion, Footer feedback widget, 404 page
- **AI-ready** — `llms.txt`, OpenCode skill file at `.opencode/skills/payfast-docs/SKILL.md`
- **Sitemap + robots.txt** for SEO

### Fixes

- Fixed `registerRts` → `registerRoutes` typo in architecture diagram
- Normalized em dashes across all doc pages
- Fixed invalid icon names (`seti:next` → `seti:react`/`seti:vite`, `mobile` → `mobile-android`, `sharing` → `code-branch`)
- Fixed Tab/Tabs component usage in `installation.mdx`
- License references corrected to Apache 2.0
- Badge switched from GitHub to npm license badge

### CI

- 4 GitHub Actions workflows: test, publish (`npm publish --provenance`), deploy-web (Cloudflare Pages), deploy-docs (Cloudflare Workers)
- Reusable test workflow used across all deployment workflows
