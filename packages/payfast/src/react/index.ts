import { useAction, useMutation, useQuery } from "convex/react";
import { useCallback, useState } from "react";
import type { ComponentApi } from "../component/types.js";
import type {
	SubscriptionStatus,
	TransactionStatus,
} from "../component/functions/statuses.js";
import { PayfastProvider, usePayfast } from "./context.js";

export { PayfastProvider, usePayfast };

type CheckoutOpts = {
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
	paymentMethod?: string;
	setup?: string;
};

type TransactionFilters = {
	userId?: string;
	status?: TransactionStatus;
	limit?: number;
};

type SubscriptionFilters = {
	userId?: string;
	status?: SubscriptionStatus;
};

function isComponentApi(val: unknown): val is ComponentApi {
	return val !== null && typeof val === "object" && "lib" in val;
}

export function usePayfastCheckout(
	component: ComponentApi,
	opts: CheckoutOpts,
): {
	generateCheckout: () => Promise<void>;
	formActionUrl: string | null;
	formFields: Record<string, string> | null;
	loading: boolean;
	error: string | null;
};
export function usePayfastCheckout(opts: CheckoutOpts): {
	generateCheckout: () => Promise<void>;
	formActionUrl: string | null;
	formFields: Record<string, string> | null;
	loading: boolean;
	error: string | null;
};
export function usePayfastCheckout(
	componentOrOpts: ComponentApi | CheckoutOpts,
	opts?: CheckoutOpts,
): {
	generateCheckout: () => Promise<void>;
	formActionUrl: string | null;
	formFields: Record<string, string> | null;
	loading: boolean;
	error: string | null;
} {
	const component = isComponentApi(componentOrOpts)
		? componentOrOpts
		: usePayfast();
	const checkoutOpts = isComponentApi(componentOrOpts)
		? opts!
		: componentOrOpts;

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
			const result = await generateCheckoutCb(checkoutOpts);
			setFormActionUrl(result.actionUrl);
			setFormFields(result.fields);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Checkout generation failed",
			);
		} finally {
			setLoading(false);
		}
	}, [generateCheckoutCb, checkoutOpts]);

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
	filters?: TransactionFilters,
): ReturnType<typeof useQuery>;
export function useTransactions(
	filters?: TransactionFilters,
): ReturnType<typeof useQuery>;
export function useTransactions(
	componentOrFilters?: ComponentApi | TransactionFilters,
	filters?: TransactionFilters,
) {
	const component = isComponentApi(componentOrFilters)
		? componentOrFilters
		: usePayfast();
	const actual = isComponentApi(componentOrFilters)
		? filters
		: componentOrFilters;
	return useQuery(component.lib.listTransactions, {
		userId: actual?.userId,
		status: actual?.status,
		limit: actual?.limit,
	});
}

export function useTransaction(
	component: ComponentApi,
	transactionId: string,
): ReturnType<typeof useQuery>;
export function useTransaction(
	transactionId: string,
): ReturnType<typeof useQuery>;
export function useTransaction(
	componentOrId: ComponentApi | string,
	transactionId?: string,
) {
	const component = isComponentApi(componentOrId)
		? componentOrId
		: usePayfast();
	const id = isComponentApi(componentOrId) ? transactionId! : componentOrId;
	return useQuery(component.lib.getTransaction, {
		// biome-ignore lint/suspicious/noExplicitAny: component lib expects Id<"transactions">
		transactionId: id as any,
	});
}

export function useSubscriptions(
	component: ComponentApi,
	filters?: SubscriptionFilters,
): ReturnType<typeof useQuery>;
export function useSubscriptions(
	filters?: SubscriptionFilters,
): ReturnType<typeof useQuery>;
export function useSubscriptions(
	componentOrFilters?: ComponentApi | SubscriptionFilters,
	filters?: SubscriptionFilters,
) {
	const component = isComponentApi(componentOrFilters)
		? componentOrFilters
		: usePayfast();
	const actual = isComponentApi(componentOrFilters)
		? filters
		: componentOrFilters;
	return useQuery(component.lib.listSubscriptions, {
		userId: actual?.userId,
		status: actual?.status,
	});
}

export function useSubscription(
	component: ComponentApi,
	token: string,
): ReturnType<typeof useQuery>;
export function useSubscription(token: string): ReturnType<typeof useQuery>;
export function useSubscription(
	componentOrToken: ComponentApi | string,
	token?: string,
) {
	const component = isComponentApi(componentOrToken)
		? componentOrToken
		: usePayfast();
	const actualToken = isComponentApi(componentOrToken)
		? token!
		: componentOrToken;
	return useQuery(component.lib.getSubscription, { token: actualToken });
}

export function useSubscriptionActions(
	component: ComponentApi,
	token: string,
): {
	pause: () => Promise<unknown>;
	unpause: () => Promise<unknown>;
	cancel: () => Promise<unknown>;
	update: (args: {
		amount?: number;
		frequency?: number;
		cycles?: number;
		runDate?: string;
	}) => Promise<unknown>;
};
export function useSubscriptionActions(token: string): {
	pause: () => Promise<unknown>;
	unpause: () => Promise<unknown>;
	cancel: () => Promise<unknown>;
	update: (args: {
		amount?: number;
		frequency?: number;
		cycles?: number;
		runDate?: string;
	}) => Promise<unknown>;
};
export function useSubscriptionActions(
	componentOrToken: ComponentApi | string,
	token?: string,
) {
	const component = isComponentApi(componentOrToken)
		? componentOrToken
		: usePayfast();
	const actualToken = isComponentApi(componentOrToken)
		? token!
		: componentOrToken;

	const pause = useAction(component.lib.pauseSubscription);
	const unpause = useAction(component.lib.unpauseSubscription);
	const cancel = useAction(component.lib.cancelSubscription);
	const update = useAction(component.lib.updateSubscription);

	return {
		pause: async () => pause({ token: actualToken }),
		unpause: async () => unpause({ token: actualToken }),
		cancel: async () => cancel({ token: actualToken }),
		update: async (args: {
			amount?: number;
			frequency?: number;
			cycles?: number;
			runDate?: string;
		}) => update({ token: actualToken, ...args }),
	};
}

export function useAdhocCharge(component: ComponentApi): {
	charge: (args: {
		token: string;
		amount: number;
		itemName?: string;
		itemDescription?: string;
		itn?: boolean;
		mPaymentId?: string;
	}) => Promise<unknown>;
	loading: boolean;
	error: string | null;
};
export function useAdhocCharge(): {
	charge: (args: {
		token: string;
		amount: number;
		itemName?: string;
		itemDescription?: string;
		itn?: boolean;
		mPaymentId?: string;
	}) => Promise<unknown>;
	loading: boolean;
	error: string | null;
};
export function useAdhocCharge(componentOrUndefined?: ComponentApi): {
	charge: (args: {
		token: string;
		amount: number;
		itemName?: string;
		itemDescription?: string;
		itn?: boolean;
		mPaymentId?: string;
	}) => Promise<unknown>;
	loading: boolean;
	error: string | null;
} {
	const component =
		componentOrUndefined !== undefined ? componentOrUndefined : usePayfast();
	const chargeAdhoc = useAction(component.lib.chargeSubscriptionAdhoc);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const charge = useCallback(
		async (args: {
			token: string;
			amount: number;
			itemName?: string;
			itemDescription?: string;
			itn?: boolean;
			mPaymentId?: string;
		}) => {
			setLoading(true);
			setError(null);
			try {
				return await chargeAdhoc(args);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Ad-hoc charge failed");
				throw err;
			} finally {
				setLoading(false);
			}
		},
		[chargeAdhoc],
	);

	return { charge, loading, error };
}

export function usePayfastOnsite(
	component: ComponentApi,
	opts: CheckoutOpts & { returnUrl: string; cancelUrl: string },
): {
	generateOnsite: () => Promise<void>;
	paymentIdentifier: string | null;
	loading: boolean;
	error: string | null;
};
export function usePayfastOnsite(
	opts: CheckoutOpts & { returnUrl: string; cancelUrl: string },
): {
	generateOnsite: () => Promise<void>;
	paymentIdentifier: string | null;
	loading: boolean;
	error: string | null;
};
export function usePayfastOnsite(
	componentOrOpts:
		| ComponentApi
		| (CheckoutOpts & { returnUrl: string; cancelUrl: string }),
	opts?: CheckoutOpts & { returnUrl: string; cancelUrl: string },
): {
	generateOnsite: () => Promise<void>;
	paymentIdentifier: string | null;
	loading: boolean;
	error: string | null;
} {
	const component = isComponentApi(componentOrOpts)
		? componentOrOpts
		: usePayfast();
	const onsiteOpts = isComponentApi(componentOrOpts) ? opts! : componentOrOpts;

	const [paymentIdentifier, setPaymentIdentifier] = useState<string | null>(
		null,
	);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const generateOnsiteAction = useAction(
		component.lib.generateOnsitePaymentIdentifier,
	);

	const generateOnsite = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const result = await generateOnsiteAction(onsiteOpts);
			setPaymentIdentifier(result.paymentIdentifier);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Onsite payment generation failed",
			);
		} finally {
			setLoading(false);
		}
	}, [generateOnsiteAction, onsiteOpts]);

	return {
		generateOnsite,
		paymentIdentifier,
		loading,
		error,
	};
}

export function useRefund(component: ComponentApi): {
	refund: (args: { ptxId: string; amount?: number }) => Promise<unknown>;
	loading: boolean;
	error: string | null;
};
export function useRefund(): {
	refund: (args: { ptxId: string; amount?: number }) => Promise<unknown>;
	loading: boolean;
	error: string | null;
};
export function useRefund(componentOrUndefined?: ComponentApi): {
	refund: (args: { ptxId: string; amount?: number }) => Promise<unknown>;
	loading: boolean;
	error: string | null;
} {
	const component =
		componentOrUndefined !== undefined ? componentOrUndefined : usePayfast();
	const refundAction = useAction(component.lib.refundTransaction);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const refund = useCallback(
		async (args: { ptxId: string; amount?: number }) => {
			setLoading(true);
			setError(null);
			try {
				return await refundAction(args);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Refund failed");
				throw err;
			} finally {
				setLoading(false);
			}
		},
		[refundAction],
	);

	return { refund, loading, error };
}
