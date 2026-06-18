import { useAction, useMutation, useQuery } from "convex/react";
import { useCallback, useState } from "react";
import type { ComponentApi } from "../component/_generated/component.js";
import type {
	SubscriptionStatus,
	TransactionStatus,
} from "../component/statuses.js";

export function usePayfastCheckout(
	component: ComponentApi,
	opts: {
		amount: number;
		itemName: string;
		returnUrl?: string;
		cancelUrl?: string;
		itemDescription?: string;
		mPaymentId?: string;
		emailConfirmation?: boolean;
		confirmationAddress?: string;
		customInt1?: number;
		customInt2?: number;
		customInt3?: number;
		customInt4?: number;
		customInt5?: number;
		customStr1?: string;
		customStr2?: string;
		customStr3?: string;
		customStr4?: string;
		customStr5?: string;
		subscriptionType?: 1 | 2;
		billingDate?: string;
		recurringAmount?: number;
		frequency?: number;
		cycles?: number;
		token?: string;
	},
): {
	generateCheckout: () => Promise<void>;
	formActionUrl: string | null;
	formFields: Record<string, string> | null;
	loading: boolean;
	error: string | null;
} {
	const [formActionUrl, setFormActionUrl] = useState<string | null>(null);
	const [formFields, setFormFields] = useState<Record<string, string> | null>(
		null,
	);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const generateCheckoutCb = useMutation(component.lib.generateCheckoutForm);

	const generateCheckout = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const result = await generateCheckoutCb(opts);
			setFormActionUrl(result.actionUrl);
			setFormFields(result.fields);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Checkout generation failed",
			);
		} finally {
			setLoading(false);
		}
	}, [generateCheckoutCb, opts]);

	return {
		generateCheckout,
		formActionUrl,
		formFields,
		loading,
		error,
	};
}

export function useTransactions(
	component: ComponentApi,
	filters?: { userId?: string; status?: TransactionStatus; limit?: number },
) {
	return useQuery(component.lib.listTransactions, {
		userId: filters?.userId,
		status: filters?.status,
		limit: filters?.limit,
	});
}

export function useTransaction(component: ComponentApi, transactionId: string) {
	return useQuery(component.lib.getTransaction, {
		// biome-ignore lint/suspicious/noExplicitAny: component lib expects Id<"transactions">
		transactionId: transactionId as any,
	});
}

export function useSubscriptions(
	component: ComponentApi,
	filters?: { userId?: string; status?: SubscriptionStatus },
) {
	return useQuery(component.lib.listSubscriptions, {
		userId: filters?.userId,
		status: filters?.status,
	});
}

export function useSubscription(component: ComponentApi, token: string) {
	return useQuery(component.lib.getSubscription, { token });
}

export function useSubscriptionActions(component: ComponentApi, token: string) {
	const pause = useAction(component.lib.pauseSubscription);
	const unpause = useAction(component.lib.unpauseSubscription);
	const cancel = useAction(component.lib.cancelSubscription);
	const update = useAction(component.lib.updateSubscription);

	return {
		pause: async () => pause({ token }),
		unpause: async () => unpause({ token }),
		cancel: async () => cancel({ token }),
		update: async (args: {
			amount?: number;
			frequency?: number;
			cycles?: number;
			runDate?: string;
		}) => update({ token, ...args }),
	};
}
