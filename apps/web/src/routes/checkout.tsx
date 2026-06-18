import { components } from "@payfastt/backend/convex/_generated/api";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { usePayfastCheckout } from "@bazileros/payfast/react";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

function CheckoutPage() {
  const {
    generateCheckout,
    formActionUrl,
    formFields,
    loading,
    error,
  } = usePayfastCheckout(components.payfast, {
    amount: 100,
    itemName: "Donation",
    returnUrl: window.location.origin + "/transactions",
    cancelUrl: window.location.origin + "/checkout",
  });

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (formActionUrl && formFields && formRef.current) {
      formRef.current.submit();
    }
  }, [formActionUrl, formFields]);

  return (
    <div className="container mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Checkout</h1>

      {error && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {!formActionUrl ? (
        <div className="grid gap-4">
          <p className="text-sm text-muted-foreground">
            Click below to make a R100 donation via PayFast.
          </p>
          <button
            type="button"
            onClick={generateCheckout}
            disabled={loading}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Generating..." : "Pay R100 with PayFast"}
          </button>
        </div>
      ) : (
        <form
          ref={formRef}
          action={formActionUrl}
          method="POST"
          className="hidden"
        >
          {formFields &&
            Object.entries(formFields).map(([key, value]) => (
              <input key={key} type="hidden" name={key} value={value} />
            ))}
        </form>
      )}

      {loading && (
        <p className="mt-4 text-sm text-muted-foreground">
          Redirecting to PayFast...
        </p>
      )}
    </div>
  );
}
