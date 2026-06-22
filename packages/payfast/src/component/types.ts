import type { FunctionReference } from "convex/server";

export type ComponentApi<Name extends string | undefined = string | undefined> =
	{
		lib: {
			generateCheckoutForm: FunctionReference<
				"mutation",
				"public",
				{
					amount: number;
					itemName: string;
					itemDescription?: string;
					mPaymentId?: string;
					returnUrl?: string;
					cancelUrl?: string;
					notifyUrl?: string;
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
					emailConfirmation?: boolean;
					confirmationAddress?: string;
					subscriptionType?: number;
					billingDate?: string;
					recurringAmount?: number;
					frequency?: number;
					cycles?: number;
					token?: string;
					paymentMethod?: string;
					setup?: string;
					userId?: string;
				},
				{
					actionUrl: string;
					fields: Record<string, string>;
					signature: string;
					transactionId: string;
				},
				Name
			>;
			listTransactions: FunctionReference<
				"query",
				"public",
				{ userId?: string; status?: string; limit?: number },
				Array<{
					_creationTime: number;
					_id: string;
					amount: number;
					currency?: string;
					itemName: string;
					itemDescription?: string;
					mPaymentId?: string;
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
					emailConfirmation?: boolean;
					confirmationAddress?: string;
					status: string;
					pfPaymentId?: number;
					pfToken?: string;
					token?: string;
					billingDate?: string;
					signature: string;
					userId?: string;
				}>,
				Name
			>;
			getTransaction: FunctionReference<
				"query",
				"public",
				{ transactionId: string },
				null | {
					_creationTime: number;
					_id: string;
					amount: number;
					currency?: string;
					itemName: string;
					itemDescription?: string;
					mPaymentId?: string;
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
					emailConfirmation?: boolean;
					confirmationAddress?: string;
					status: string;
					pfPaymentId?: number;
					pfToken?: string;
					token?: string;
					billingDate?: string;
					signature: string;
					userId?: string;
				},
				Name
			>;
			listSubscriptions: FunctionReference<
				"query",
				"public",
				{ userId?: string; status?: string; limit?: number },
				Array<{
					_creationTime: number;
					_id: string;
					token: string;
					status: string;
					amount?: number;
					cycles?: number;
					frequency?: number;
					cyclesComplete?: number;
					runDate?: string;
					nextRunDate?: string;
					itemName: string;
					userId?: string;
				}>,
				Name
			>;
			getSubscription: FunctionReference<
				"query",
				"public",
				{ token: string },
				null | {
					_creationTime: number;
					_id: string;
					token: string;
					status: string;
					amount?: number;
					cycles?: number;
					frequency?: number;
					cyclesComplete?: number;
					runDate?: string;
					nextRunDate?: string;
					itemName: string;
					userId?: string;
				},
				Name
			>;
			pauseSubscription: FunctionReference<
				"action",
				"public",
				{ token: string; userId?: string },
				{ success: boolean },
				Name
			>;
			unpauseSubscription: FunctionReference<
				"action",
				"public",
				{ token: string; userId?: string },
				{ success: boolean },
				Name
			>;
			cancelSubscription: FunctionReference<
				"action",
				"public",
				{ token: string; userId?: string },
				{ success: boolean },
				Name
			>;
			updateSubscription: FunctionReference<
				"action",
				"public",
				{
					token: string;
					amount?: number;
					cycles?: number;
					frequency?: number;
					runDate?: string;
					userId?: string;
				},
				{ success: boolean },
				Name
			>;
			saveUserProfile: FunctionReference<
				"mutation",
				"public",
				{
					userId: string;
					email?: string;
					name?: string;
					metadata?: any;
				},
				string,
				Name
			>;
			getUserProfile: FunctionReference<
				"query",
				"public",
				{ userId: string },
				null | {
					_creationTime: number;
					_id: string;
					userId: string;
					email?: string;
					name?: string;
					metadata?: any;
				},
				Name
			>;
			processITN: FunctionReference<
				"mutation",
				"public",
				{ pfData: any },
				{ status: string },
				Name
			>;
			generateOnsitePaymentIdentifier: FunctionReference<
				"action",
				"public",
				{
					amount: number;
					itemName: string;
					itemDescription?: string;
					mPaymentId?: string;
					returnUrl?: string;
					cancelUrl?: string;
					notifyUrl?: string;
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
					emailConfirmation?: boolean;
					confirmationAddress?: string;
					paymentMethod?: string;
					setup?: string;
					userId?: string;
				},
				{
					paymentIdentifier: string;
					signature: string;
					transactionId: string;
				},
				Name
			>;
			chargeSubscriptionAdhoc: FunctionReference<
				"action",
				"public",
				{
					token: string;
					amount: number;
					itemName?: string;
					itemDescription?: string;
					itn?: boolean;
					mPaymentId?: string;
					userId?: string;
				},
				{ success: boolean; response: string },
				Name
			>;
			refundTransaction: FunctionReference<
				"action",
				"public",
				{ ptxId: string; amount?: number; userId?: string },
				{ success: boolean; response: string },
				Name
			>;
			queryTransactions: FunctionReference<
				"action",
				"public",
				{ offset?: number },
				unknown,
				Name
			>;
			queryCreditCards: FunctionReference<
				"action",
				"public",
				{},
				unknown,
				Name
			>;
		};
	};
