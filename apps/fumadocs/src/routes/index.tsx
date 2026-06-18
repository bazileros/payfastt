import { createFileRoute, Link } from "@tanstack/react-router";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import { ArrowRight } from "lucide-react";

import { baseOptions } from "@/lib/layout.shared";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <HomeLayout {...baseOptions()}>
      <main className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-fd-border bg-fd-secondary px-4 py-1.5 text-xs font-medium text-fd-muted-foreground mb-8">
            @bazileros/payfast
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-fd-foreground">
            PayFast payments
            <br />
            <span className="text-fd-primary">for Convex apps</span>
          </h1>

          <p className="mt-4 text-sm text-fd-muted-foreground max-w-md leading-relaxed">
            A turnkey Convex component for one-time payments, subscriptions, tokenized charges,
            refunds, and ITN webhooks via PayFast.
          </p>

          <div className="mt-8 flex items-center gap-3">
            <Link
              to="/docs/$"
              params={{ _splat: "" }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-fd-primary px-4 py-2 text-sm font-medium text-fd-primary-foreground transition-opacity hover:opacity-90"
            >
              Get started
              <ArrowRight className="size-3.5" />
            </Link>
            <a
              href="https://github.com/bazileros/payfastt"
              className="inline-flex items-center gap-1.5 rounded-lg border border-fd-border bg-fd-secondary px-4 py-2 text-sm font-medium text-fd-secondary-foreground transition-colors hover:bg-fd-accent"
            >
              GitHub
            </a>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-6 text-left">
            <div className="space-y-1.5">
              <h3 className="text-sm font-medium text-fd-foreground">Payments</h3>
              <p className="text-xs text-fd-muted-foreground leading-relaxed">
                One-time and recurring via Custom Integration & REST API
              </p>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-medium text-fd-foreground">Webhooks</h3>
              <p className="text-xs text-fd-muted-foreground leading-relaxed">
                ITN with echo-back validation & typed event handlers
              </p>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-medium text-fd-foreground">React hooks</h3>
              <p className="text-xs text-fd-muted-foreground leading-relaxed">
                usePayfastCheckout, useTransactions, useSubscriptions
              </p>
            </div>
          </div>
        </div>
      </main>
    </HomeLayout>
  );
}
