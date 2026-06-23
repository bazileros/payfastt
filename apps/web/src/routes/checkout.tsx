import { api } from "@payfastt/backend/convex/_generated/api";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { useCallback, useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/checkout")({
	component: CheckoutPage,
});

function CheckoutPage() {
	const generateCheckoutCb = useMutation(api.payfast.generateCheckoutForm);
	const [formActionUrl, setFormActionUrl] = useState<string | null>(null);
	const [formFields, setFormFields] = useState<Record<string, string> | null>(
		null,
	);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const formRef = useRef<HTMLFormElement>(null);

	const generateCheckout = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const result = await generateCheckoutCb({
				amount: 100,
				itemName: "Donation",
				returnUrl: `${window.location.origin}/transactions`,
				cancelUrl: `${window.location.origin}/checkout`,
			});
			setFormActionUrl(result.actionUrl);
			setFormFields(result.fields);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Checkout generation failed",
			);
		} finally {
			setLoading(false);
		}
	}, [generateCheckoutCb]);

	useEffect(() => {
		if (formActionUrl && formFields && formRef.current) {
			formRef.current.submit();
		}
	}, [formActionUrl, formFields]);

	return (
		<div className="container mx-auto max-w-lg px-4 py-8">
			<h1 className="mb-6 font-bold text-2xl">Checkout</h1>

			{error && (
				<div className="mb-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-red-800 text-sm">
					{error}
				</div>
			)}

			{!formActionUrl ? (
				<div className="grid gap-4">
					<p className="text-muted-foreground text-sm">
						Click below to make a R100 donation via PayFast.
					</p>
					<button
						type="button"
						onClick={generateCheckout}
						disabled={loading}
						className="rounded-md bg-blue-600 px-4 py-2 font-medium text-sm text-white hover:bg-blue-700 disabled:opacity-50"
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
				<p className="mt-4 text-muted-foreground text-sm">
					Redirecting to PayFast...
				</p>
			)}
		</div>
	);
}
