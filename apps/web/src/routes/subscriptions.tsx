import { createFileRoute } from "@tanstack/react-router";
import { useSubscriptions, useSubscriptionActions } from "@bazileros/payfast/react";
import { toast } from "sonner";

export const Route = createFileRoute("/subscriptions")({
  component: SubscriptionsPage,
});

function SubscriptionRow({ token }: { token: string }) {
  const { pause, unpause, cancel } = useSubscriptionActions(token);

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={async () => {
          try {
            await pause();
            toast.success("Subscription paused");
          } catch (err) {
            toast.error(
              err instanceof Error ? err.message : "Failed to pause",
            );
          }
        }}
        className="rounded bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 hover:bg-yellow-200"
      >
        Pause
      </button>
      <button
        type="button"
        onClick={async () => {
          try {
            await unpause();
            toast.success("Subscription resumed");
          } catch (err) {
            toast.error(
              err instanceof Error ? err.message : "Failed to resume",
            );
          }
        }}
        className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800 hover:bg-green-200"
      >
        Unpause
      </button>
      <button
        type="button"
        onClick={async () => {
          try {
            await cancel();
            toast.success("Subscription cancelled");
          } catch (err) {
            toast.error(
              err instanceof Error ? err.message : "Failed to cancel",
            );
          }
        }}
        className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-800 hover:bg-red-200"
      >
        Cancel
      </button>
    </div>
  );
}

function SubscriptionsPage() {
  const subscriptions = useSubscriptions();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Subscriptions</h1>

      {subscriptions === undefined ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : subscriptions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No subscriptions yet. Create one from the checkout page by adding
          subscription options.
        </p>
      ) : (
        <div className="grid gap-4">
          {subscriptions.map((sub) => (
            <div
              key={sub._id}
              className="rounded-md border p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium">{sub.itemName}</span>
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    sub.status === "active"
                      ? "bg-green-100 text-green-800"
                      : sub.status === "paused"
                        ? "bg-yellow-100 text-yellow-800"
                        : sub.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {sub.status}
                </span>
              </div>
              <div className="mb-3 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div>Token: <span className="font-mono text-xs">{sub.token}</span></div>
                {sub.amount !== undefined && <div>Amount: R{sub.amount.toFixed(2)}</div>}
                {sub.frequency !== undefined && <div>Frequency: every {sub.frequency} months</div>}
                {sub.cycles !== undefined && <div>Cycles: {sub.cycles}</div>}
              </div>
              <SubscriptionRow token={sub.token} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
