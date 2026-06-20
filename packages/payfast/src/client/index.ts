import type {
	GenericActionCtx,
	GenericDataModel,
	GenericMutationCtx,
	GenericQueryCtx,
	HttpRouter,
} from "convex/server";
import { httpActionGeneric } from "convex/server";
import type { ComponentApi } from "../component/_generated/component.js";
import { validateItnSourceIp } from "../component/ips.js";
import type {
	SubscriptionStatus,
	TransactionStatus,
} from "../component/statuses.js";

type QueryCtx = Pick<GenericQueryCtx<GenericDataModel>, "runQuery">;
type MutationCtx = Pick<
	GenericMutationCtx<GenericDataModel>,
	"runQuery" | "runMutation"
>;
type ActionCtx = Pick<
	GenericActionCtx<GenericDataModel>,
	"runQuery" | "runMutation" | "runAction"
>;

export type PayfastComponent = ComponentApi;

export type CheckoutArgs = {
	amount: number;
	itemName: string;
	returnUrl?: string;
	cancelUrl?: string;
	notifyUrl?: string;
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

export type SplitPaymentOptions = {
	merchantId: string;
	amount: string;
	table?: string;
	passphrase?: string;
};

/** ITN event handlers dispatched after built-in persistence succeeds. */
export type ItnEventHandlers = {
	/** Called after every successfully processed ITN */
	onAny?: (
		ctx: { runMutation: (...args: never) => unknown },
		pfData: Record<string, string>,
	) => Promise<void>;
	/** Called when payment_status is COMPLETE */
	onPaymentComplete?: (
		ctx: { runMutation: (...args: never) => unknown },
		pfData: Record<string, string>,
	) => Promise<void>;
	/** Called when payment_status is CANCELLED */
	onPaymentCancelled?: (
		ctx: { runMutation: (...args: never) => unknown },
		pfData: Record<string, string>,
	) => Promise<void>;
	/** Called when payment_status is REFUNDED */
	onPaymentRefunded?: (
		ctx: { runMutation: (...args: never) => unknown },
		pfData: Record<string, string>,
	) => Promise<void>;
	/** Called when subscription_status indicates cancellation */
	onSubscriptionCancelled?: (
		ctx: { runMutation: (...args: never) => unknown },
		pfData: Record<string, string>,
	) => Promise<void>;
	/** Called when subscription data is updated via ITN */
	onSubscriptionUpdated?: (
		ctx: { runMutation: (...args: never) => unknown },
		pfData: Record<string, string>,
	) => Promise<void>;
};

async function dispatchEvents(
	events: ItnEventHandlers,
	ctx: { runMutation: (...args: never) => unknown },
	pfData: Record<string, string>,
) {
	const status = pfData.pf_payment_status || pfData.payment_status;
	const subStatus = pfData.subscription_status;

	await events.onAny?.(ctx, pfData);

	if (status === "COMPLETE") await events.onPaymentComplete?.(ctx, pfData);
	if (status === "CANCELLED") await events.onPaymentCancelled?.(ctx, pfData);
	if (status === "REFUNDED") await events.onPaymentRefunded?.(ctx, pfData);
	if (subStatus === "cancelled")
		await events.onSubscriptionCancelled?.(ctx, pfData);
	if (subStatus) await events.onSubscriptionUpdated?.(ctx, pfData);
}

export class Payfast {
	readonly sandbox: boolean;
	private getUserInfo?: (ctx: {
		runQuery: (...args: never) => unknown;
	}) => Promise<{
		userId: string;
	}>;

	constructor(
		public component: PayfastComponent,
		opts?: {
			sandbox?: boolean;
			/**
			 * Callback to resolve the current user's identity from context.
			 * When set, class methods that accept an optional `userId` will
			 * resolve it automatically — callers can skip passing it.
			 *
			 * @example
			 * ```ts
			 * getUserInfo: async (ctx) => {
			 *   const identity = await getAuthIdentity(ctx);
			 *   return { userId: identity.subject };
			 * }
			 * ```
			 */
			getUserInfo?: (ctx: {
				runQuery: (...args: never) => unknown;
			}) => Promise<{
				userId: string;
			}>;
		},
	) {
		this.sandbox = opts?.sandbox ?? false;
		this.getUserInfo = opts?.getUserInfo;
	}

	private async resolveUserId(
		ctx: { runQuery: (...args: never) => unknown },
		explicit?: string,
	): Promise<string | undefined> {
		if (explicit !== undefined) return explicit;
		return await this.getUserInfo?.(ctx).then((u) => u.userId);
	}

	async createCheckoutSession(
		ctx: ActionCtx,
		args: CheckoutArgs & { userId?: string },
	) {
		const result = await ctx.runMutation(
			this.component.lib.generateCheckoutForm,
			args,
		);
		return {
			formActionUrl: result.actionUrl,
			formFields: result.fields,
		};
	}

	async pauseSubscription(
		ctx: ActionCtx,
		args: { token: string; userId?: string },
	) {
		const userId = await this.resolveUserId(ctx, args.userId);
		return await ctx.runAction(this.component.lib.pauseSubscription, {
			token: args.token,
			userId,
		});
	}

	async unpauseSubscription(
		ctx: ActionCtx,
		args: { token: string; userId?: string },
	) {
		const userId = await this.resolveUserId(ctx, args.userId);
		return await ctx.runAction(this.component.lib.unpauseSubscription, {
			token: args.token,
			userId,
		});
	}

	async cancelSubscription(
		ctx: ActionCtx,
		args: { token: string; userId?: string },
	) {
		const userId = await this.resolveUserId(ctx, args.userId);
		return await ctx.runAction(this.component.lib.cancelSubscription, {
			token: args.token,
			userId,
		});
	}

	async updateSubscription(
		ctx: ActionCtx,
		args: {
			token: string;
			amount?: number;
			frequency?: number;
			cycles?: number;
			runDate?: string;
			userId?: string;
		},
	) {
		const userId = await this.resolveUserId(ctx, args.userId);
		return await ctx.runAction(this.component.lib.updateSubscription, {
			...args,
			userId,
		});
	}

	async listTransactions(
		ctx: QueryCtx | MutationCtx,
		args?: {
			userId?: string;
			status?: TransactionStatus;
			limit?: number;
		},
	) {
		const userId = args?.userId;
		return await ctx.runQuery(this.component.lib.listTransactions, {
			userId,
			status: args?.status,
			limit: args?.limit,
		});
	}

	async getTransaction(ctx: QueryCtx | MutationCtx, transactionId: string) {
		return await ctx.runQuery(this.component.lib.getTransaction, {
			// biome-ignore lint/suspicious/noExplicitAny: component lib expects Id<"transactions">
			transactionId: transactionId as any,
		});
	}

	async listSubscriptions(
		ctx: QueryCtx | MutationCtx,
		args?: {
			userId?: string;
			status?: SubscriptionStatus;
		},
	) {
		return await ctx.runQuery(this.component.lib.listSubscriptions, {
			userId: args?.userId,
			status: args?.status,
		});
	}

	async getSubscription(ctx: QueryCtx | MutationCtx, token: string) {
		return await ctx.runQuery(this.component.lib.getSubscription, {
			token,
		});
	}

	async createOnsitePayment(
		ctx: ActionCtx,
		args: CheckoutArgs & { userId?: string },
	) {
		const userId = await this.resolveUserId(ctx, args.userId);
		return await ctx.runAction(
			this.component.lib.generateOnsitePaymentIdentifier,
			{ ...args, userId },
		);
	}

	async chargeAdhoc(
		ctx: ActionCtx,
		args: {
			token: string;
			amount: number;
			itemName?: string;
			itemDescription?: string;
			itn?: boolean;
			mPaymentId?: string;
			userId?: string;
		},
	) {
		const userId = await this.resolveUserId(ctx, args.userId);
		return await ctx.runAction(this.component.lib.chargeSubscriptionAdhoc, {
			...args,
			userId,
		});
	}

	async refund(
		ctx: ActionCtx,
		args: { ptxId: string; amount?: number; userId?: string },
	) {
		return await ctx.runAction(this.component.lib.refundTransaction, args);
	}

	async queryTransactions(ctx: ActionCtx, args?: { offset?: number }) {
		return await ctx.runAction(
			this.component.lib.queryTransactions,
			args ?? {},
		);
	}

	async queryCreditCards(ctx: ActionCtx) {
		return await ctx.runAction(this.component.lib.queryCreditCards, {});
	}

	getCardUpdateUrl(token: string, returnUrl?: string): string {
		const host = this.sandbox ? "sandbox.payfast.co.za" : "www.payfast.co.za";
		let url = `https://${host}/eng/recurring/update/${encodeURIComponent(token)}`;
		if (returnUrl) {
			url += `?return=${encodeURIComponent(returnUrl)}`;
		}
		return url;
	}
}

export function registerRoutes(
	http: HttpRouter,
	component: PayfastComponent,
	config?: {
		itnPath?: string;
		skipIpCheck?: boolean;
		/**
		 * Custom event handlers for ITN notifications.
		 * Called after built-in persistence (transaction/subscription records).
		 */
		events?: ItnEventHandlers;
	},
) {
	const itnPath = config?.itnPath ?? "/payfast/itn";

	http.route({
		path: itnPath,
		method: "POST",
		handler: httpActionGeneric(async (ctx, req) => {
			const text = await req.text();
			const pfData: Record<string, string> = {};
			for (const part of text.split("&")) {
				const [key, value] = part.split("=");
				if (key && value !== undefined) {
					pfData[decodeURIComponent(key.replace(/\+/g, " "))] =
						decodeURIComponent(value.replace(/\+/g, " "));
				}
			}

			if (!config?.skipIpCheck) {
				const clientIp =
					req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
					req.headers.get("x-real-ip") ??
					null;
				if (clientIp && !validateItnSourceIp(clientIp)) {
					return new Response("INVALID", { status: 200 });
				}
			}

			await ctx.runMutation(component.lib.processITN, { pfData });

			if (config?.events) {
				await dispatchEvents(config.events, ctx, pfData);
			}

			return new Response("OK", { status: 200 });
		}),
	});
}
