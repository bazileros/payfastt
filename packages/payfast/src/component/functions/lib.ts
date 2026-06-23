import { v } from "convex/values";
import { internal } from "./_generated/api.js";
import type { Doc } from "./_generated/dataModel.js";
import type { Env } from "./_generated/server.js";
import {
	action,
	internalMutation,
	internalQuery,
	mutation,
	query,
} from "./_generated/server.js";
import { callPayfastApi } from "./api.js";
import { md5 } from "./md5.js";
import schema from "./schema.js";
import { asTransactionStatus } from "./statuses.js";

const transactionDoc = schema.tables.transactions.validator.extend({
	_id: v.id("transactions"),
	_creationTime: v.number(),
});

const subscriptionDoc = schema.tables.subscriptions.validator.extend({
	_id: v.id("subscriptions"),
	_creationTime: v.number(),
});

const userProfileDoc = schema.tables.userProfiles.validator.extend({
	_id: v.id("userProfiles"),
	_creationTime: v.number(),
});

type CallSubscriptionCtx = {
	// biome-ignore lint/suspicious/noExplicitAny: runQuery signature differs between ctx types
	runQuery: any;
	// biome-ignore lint/suspicious/noExplicitAny: runMutation signature differs between ctx types
	runMutation: any;
};

export const generateCheckoutForm = mutation({
	args: {
		amount: v.number(),
		itemName: v.string(),
		itemDescription: v.optional(v.string()),
		mPaymentId: v.optional(v.string()),
		returnUrl: v.optional(v.string()),
		cancelUrl: v.optional(v.string()),
		notifyUrl: v.optional(v.string()),
		customInt1: v.optional(v.number()),
		customInt2: v.optional(v.number()),
		customInt3: v.optional(v.number()),
		customInt4: v.optional(v.number()),
		customInt5: v.optional(v.number()),
		customStr1: v.optional(v.string()),
		customStr2: v.optional(v.string()),
		customStr3: v.optional(v.string()),
		customStr4: v.optional(v.string()),
		customStr5: v.optional(v.string()),
		emailConfirmation: v.optional(v.boolean()),
		confirmationAddress: v.optional(v.string()),
		subscriptionType: v.optional(v.number()),
		billingDate: v.optional(v.string()),
		recurringAmount: v.optional(v.number()),
		frequency: v.optional(v.number()),
		cycles: v.optional(v.number()),
		token: v.optional(v.string()),
		paymentMethod: v.optional(v.string()),
		setup: v.optional(v.string()),
		userId: v.optional(v.string()),
	},
	returns: v.object({
		actionUrl: v.string(),
		fields: v.record(v.string(), v.string()),
		signature: v.string(),
		transactionId: v.string(),
	}),
	handler: async (ctx, args) => {
		const {
			PAYFAST_MERCHANT_ID,
			PAYFAST_MERCHANT_KEY,
			PAYFAST_PASSPHRASE,
			PAYFAST_SANDBOX,
			// biome-ignore lint/suspicious/noExplicitAny: handler ctx type lacks env
		} = (ctx as any).env as Env;
		const host =
			PAYFAST_SANDBOX === "true"
				? "sandbox.payfast.co.za"
				: "www.payfast.co.za";
		const actionUrl = `https://${host}/eng/process`;
		const fields: Record<string, string> = {
			merchant_id: PAYFAST_MERCHANT_ID,
			merchant_key: PAYFAST_MERCHANT_KEY,
			amount: args.amount.toFixed(2),
			item_name: args.itemName,
		};

		if (args.itemDescription) fields.item_description = args.itemDescription;
		if (args.mPaymentId) fields.m_payment_id = args.mPaymentId;
		if (args.returnUrl) fields.return_url = args.returnUrl;
		if (args.cancelUrl) fields.cancel_url = args.cancelUrl;
		if (args.notifyUrl) fields.notify_url = args.notifyUrl;
		if (args.emailConfirmation) fields.email_confirmation = "1";
		if (args.confirmationAddress)
			fields.confirmation_address = args.confirmationAddress;
		if (args.customInt1 !== undefined)
			fields.custom_int1 = String(args.customInt1);
		if (args.customInt2 !== undefined)
			fields.custom_int2 = String(args.customInt2);
		if (args.customInt3 !== undefined)
			fields.custom_int3 = String(args.customInt3);
		if (args.customInt4 !== undefined)
			fields.custom_int4 = String(args.customInt4);
		if (args.customInt5 !== undefined)
			fields.custom_int5 = String(args.customInt5);
		if (args.customStr1) fields.custom_str1 = args.customStr1;
		if (args.customStr2) fields.custom_str2 = args.customStr2;
		if (args.customStr3) fields.custom_str3 = args.customStr3;
		if (args.customStr4) fields.custom_str4 = args.customStr4;
		if (args.customStr5) fields.custom_str5 = args.customStr5;

		if (args.subscriptionType !== undefined) {
			fields.subscription_type = String(args.subscriptionType);
			if (args.billingDate) fields.billing_date = args.billingDate;
			if (args.recurringAmount !== undefined)
				fields.recurring_amount = args.recurringAmount.toFixed(2);
			if (args.frequency !== undefined)
				fields.frequency = String(args.frequency);
			if (args.cycles !== undefined) fields.cycles = String(args.cycles);
		}

		if (args.token) fields.token = args.token;

		if (args.paymentMethod) fields.payment_method = args.paymentMethod;
		if (args.setup) fields.setup = args.setup;

		const signature = generateSignature(fields, PAYFAST_PASSPHRASE);
		fields.signature = signature;

		const createdTransactionId = await ctx.db.insert("transactions", {
			amount: args.amount,
			itemName: args.itemName,
			itemDescription: args.itemDescription,
			status: "PENDING",
			signature,
			userId: args.userId,
		});

		return {
			actionUrl,
			fields,
			signature,
			transactionId: createdTransactionId,
		};
	},
});

function generateSignature(
	fields: Record<string, string>,
	passphrase?: string,
): string {
	const keys = Object.keys(fields).sort();
	const parts: string[] = [];
	for (const key of keys) {
		if (key === "signature") continue;
		const value = fields[key];
		if (value !== undefined && value !== null && value !== "") {
			parts.push(`${key}=${encodeURIComponent(value).replace(/%20/g, "+")}`);
		}
	}
	let raw = parts.join("&");
	if (passphrase) {
		raw += `&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, "+")}`;
	}
	return md5(raw);
}

export const listTransactions = query({
	args: {
		userId: v.optional(v.string()),
		status: v.optional(v.string()),
		limit: v.optional(v.number()),
	},
	returns: v.array(transactionDoc),
	handler: async (ctx, args) => {
		let results: Doc<"transactions">[];
		if (args.userId) {
			results = await ctx.db
				.query("transactions")
				.withIndex("userId", (q) => q.eq("userId", args.userId))
				.collect();
		} else {
			results = await ctx.db.query("transactions").collect();
		}
		if (args.status) {
			results = results.filter((t) => t.status === args.status);
		}
		return args.limit ? results.slice(0, args.limit) : results;
	},
});

export const getTransaction = query({
	args: { transactionId: v.id("transactions") },
	returns: v.union(v.null(), transactionDoc),
	handler: async (ctx, args) => {
		return await ctx.db.get(args.transactionId);
	},
});

export const listSubscriptions = query({
	args: {
		userId: v.optional(v.string()),
		status: v.optional(v.string()),
		limit: v.optional(v.number()),
	},
	returns: v.array(subscriptionDoc),
	handler: async (ctx, args) => {
		let results: Doc<"subscriptions">[];
		if (args.userId) {
			results = await ctx.db
				.query("subscriptions")
				.withIndex("userId", (q) => q.eq("userId", args.userId))
				.collect();
		} else {
			results = await ctx.db.query("subscriptions").collect();
		}
		if (args.status) {
			results = results.filter((t) => t.status === args.status);
		}
		return args.limit ? results.slice(0, args.limit) : results;
	},
});

export const getSubscription = query({
	args: { token: v.string() },
	returns: v.union(v.null(), subscriptionDoc),
	handler: async (ctx, args) => {
		return await ctx.db
			.query("subscriptions")
			.withIndex("token", (q) => q.eq("token", args.token))
			.first();
	},
});

export const saveUserProfile = mutation({
	args: {
		userId: v.string(),
		email: v.optional(v.string()),
		name: v.optional(v.string()),
		metadata: v.optional(v.any()),
	},
	returns: v.string(),
	handler: async (ctx, args) => {
		const existing = await ctx.db
			.query("userProfiles")
			.withIndex("userId", (q) => q.eq("userId", args.userId))
			.first();
		if (existing) {
			await ctx.db.patch(existing._id, {
				email: args.email,
				name: args.name,
				metadata: args.metadata,
			});
			return existing._id;
		}
		return await ctx.db.insert("userProfiles", {
			userId: args.userId,
			email: args.email,
			name: args.name,
			metadata: args.metadata,
		});
	},
});

export const getUserProfile = query({
	args: { userId: v.string() },
	returns: v.union(v.null(), userProfileDoc),
	handler: async (ctx, args) => {
		return await ctx.db
			.query("userProfiles")
			.withIndex("userId", (q) => q.eq("userId", args.userId))
			.first();
	},
});

export const _getSubscriptionByToken = internalQuery({
	args: { token: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("subscriptions")
			.withIndex("token", (q) => q.eq("token", args.token))
			.first();
	},
});

export const _addRecurringLog = internalMutation({
	args: {
		action: v.string(),
		pfToken: v.string(),
		token: v.string(),
		status: v.string(),
		requestBody: v.optional(v.string()),
		responseBody: v.optional(v.string()),
		errorMessage: v.optional(v.string()),
		userId: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		await ctx.db.insert("recurringLogs", {
			action: args.action,
			pfToken: args.pfToken,
			token: args.token,
			status: args.status,
			requestBody: args.requestBody,
			responseBody: args.responseBody,
			errorMessage: args.errorMessage,
			userId: args.userId,
		});
	},
});

async function callSubscriptionApi(
	ctx: CallSubscriptionCtx,
	token: string,
	action: string,
	opts?: { bodyFields?: Record<string, string>; userId?: string },
): Promise<{ success: boolean }> {
	const sub = await ctx.runQuery(internal.lib._getSubscriptionByToken, {
		token,
	});
	if (!sub) throw new Error(`Subscription not found: ${token}`);

	// biome-ignore lint/suspicious/noExplicitAny: Convex action ctx lacks env
	const env = (ctx as any).env as Env;
	const path = `/subscriptions/${encodeURIComponent(token)}/${action}`;

	const result = await callPayfastApi("PUT", path, env, {
		bodyFields: opts?.bodyFields,
	});

	await ctx.runMutation(internal.lib._addRecurringLog, {
		action,
		pfToken: token,
		token,
		status: result.ok ? "success" : "error",
		requestBody: opts?.bodyFields
			? new URLSearchParams(opts.bodyFields).toString()
			: "",
		responseBody: result.body,
		errorMessage: result.ok ? undefined : `HTTP ${result.status}`,
		userId: opts?.userId,
	});

	if (!result.ok) {
		throw new Error(
			`Failed to ${action} subscription: ${result.status} ${result.body}`,
		);
	}

	return { success: true };
}

export const pauseSubscription = action({
	args: { token: v.string(), userId: v.optional(v.string()) },
	returns: v.object({ success: v.boolean() }),
	handler: async (ctx, args) => {
		return await callSubscriptionApi(ctx, args.token, "pause", {
			userId: args.userId,
		});
	},
});

export const unpauseSubscription = action({
	args: { token: v.string(), userId: v.optional(v.string()) },
	returns: v.object({ success: v.boolean() }),
	handler: async (ctx, args) => {
		return await callSubscriptionApi(ctx, args.token, "unpause", {
			userId: args.userId,
		});
	},
});

export const cancelSubscription = action({
	args: { token: v.string(), userId: v.optional(v.string()) },
	returns: v.object({ success: v.boolean() }),
	handler: async (ctx, args) => {
		return await callSubscriptionApi(ctx, args.token, "cancel", {
			userId: args.userId,
		});
	},
});

export const updateSubscription = action({
	args: {
		token: v.string(),
		amount: v.optional(v.number()),
		cycles: v.optional(v.number()),
		frequency: v.optional(v.number()),
		runDate: v.optional(v.string()),
		userId: v.optional(v.string()),
	},
	returns: v.object({ success: v.boolean() }),
	handler: async (ctx, args) => {
		const bodyFields: Record<string, string> = {};
		if (args.amount !== undefined) bodyFields.amount = args.amount.toFixed(2);
		if (args.cycles !== undefined) bodyFields.cycles = String(args.cycles);
		if (args.frequency !== undefined)
			bodyFields.frequency = String(args.frequency);
		if (args.runDate) bodyFields.run_date = args.runDate;
		return await callSubscriptionApi(ctx, args.token, "update", {
			bodyFields,
			userId: args.userId,
		});
	},
});

export const chargeSubscriptionAdhoc = action({
	args: {
		token: v.string(),
		amount: v.number(),
		itemName: v.optional(v.string()),
		itemDescription: v.optional(v.string()),
		itn: v.optional(v.boolean()),
		mPaymentId: v.optional(v.string()),
		userId: v.optional(v.string()),
	},
	returns: v.object({ success: v.boolean(), response: v.string() }),
	// biome-ignore lint/suspicious/noExplicitAny: action ctx lacks env
	handler: async (ctx: any, args) => {
		const env = ctx.env as Env;

		if (env.PAYFAST_SANDBOX === "true") {
			throw new Error("Adhoc charges are not available in sandbox mode");
		}

		const bodyFields: Record<string, string> = {
			amount: String(Math.round(args.amount * 100)),
		};
		if (args.itemName) bodyFields.item_name = args.itemName;
		if (args.itemDescription)
			bodyFields.item_description = args.itemDescription;
		if (args.itn !== undefined) bodyFields.itn = args.itn ? "true" : "false";
		if (args.mPaymentId) bodyFields.m_payment_id = args.mPaymentId;

		const path = `/subscriptions/${encodeURIComponent(args.token)}/adhoc`;
		const result = await callPayfastApi("POST", path, env, {
			bodyFields,
		});

		await ctx.runMutation(internal.lib._addRecurringLog, {
			action: "charge_adhoc",
			pfToken: args.token,
			token: args.token,
			status: result.ok ? "success" : "error",
			requestBody: new URLSearchParams(bodyFields).toString(),
			responseBody: result.body,
			errorMessage: result.ok ? undefined : `HTTP ${result.status}`,
			userId: args.userId,
		});

		if (!result.ok) {
			throw new Error(`Adhoc charge failed: ${result.status} ${result.body}`);
		}

		return { success: true, response: result.body };
	},
});

export const refundTransaction = action({
	args: {
		ptxId: v.string(),
		amount: v.optional(v.number()),
		userId: v.optional(v.string()),
	},
	returns: v.object({ success: v.boolean(), response: v.string() }),
	// biome-ignore lint/suspicious/noExplicitAny: action ctx lacks env
	handler: async (ctx: any, args) => {
		const env = ctx.env as Env;

		if (env.PAYFAST_SANDBOX === "true") {
			throw new Error("Refunds are not available in sandbox mode");
		}

		const bodyFields: Record<string, string> = {
			ptx_id: args.ptxId,
		};
		if (args.amount !== undefined) {
			bodyFields.amount = args.amount.toFixed(2);
		}

		const result = await callPayfastApi("POST", "/refunds", env, {
			bodyFields,
		});

		if (!result.ok) {
			throw new Error(`Refund failed: ${result.status} ${result.body}`);
		}

		return { success: true, response: result.body };
	},
});

export const queryTransactions = action({
	args: {
		offset: v.optional(v.number()),
	},
	returns: v.any(),
	// biome-ignore lint/suspicious/noExplicitAny: action ctx lacks env
	handler: async (ctx: any, args) => {
		const env = ctx.env as Env;
		let path = "/transactions";
		if (args.offset !== undefined) {
			path += `?offset=${args.offset}`;
		}
		const result = await callPayfastApi("GET", path, env);

		if (!result.ok) {
			throw new Error(
				`Transaction history query failed: ${result.status} ${result.body}`,
			);
		}

		return JSON.parse(result.body);
	},
});

export const queryCreditCards = action({
	args: {},
	returns: v.any(),
	// biome-ignore lint/suspicious/noExplicitAny: action ctx lacks env
	handler: async (ctx: any) => {
		const env = ctx.env as Env;
		const result = await callPayfastApi("GET", "/credit-cards", env);

		if (!result.ok) {
			throw new Error(
				`Credit card query failed: ${result.status} ${result.body}`,
			);
		}

		return JSON.parse(result.body);
	},
});

export const _insertTransaction = internalMutation({
	args: {
		amount: v.number(),
		itemName: v.string(),
		itemDescription: v.optional(v.string()),
		mPaymentId: v.optional(v.string()),
		status: v.string(),
		signature: v.string(),
		userId: v.optional(v.string()),
	},
	// biome-ignore lint/suspicious/noExplicitAny: internal mutation ctx
	handler: async (ctx: any, args) => {
		return ctx.db.insert("transactions", args) as Promise<string>;
	},
});

export const generateOnsitePaymentIdentifier = action({
	args: {
		amount: v.number(),
		itemName: v.string(),
		itemDescription: v.optional(v.string()),
		mPaymentId: v.optional(v.string()),
		returnUrl: v.optional(v.string()),
		cancelUrl: v.optional(v.string()),
		notifyUrl: v.optional(v.string()),
		customInt1: v.optional(v.number()),
		customInt2: v.optional(v.number()),
		customInt3: v.optional(v.number()),
		customInt4: v.optional(v.number()),
		customInt5: v.optional(v.number()),
		customStr1: v.optional(v.string()),
		customStr2: v.optional(v.string()),
		customStr3: v.optional(v.string()),
		customStr4: v.optional(v.string()),
		customStr5: v.optional(v.string()),
		emailConfirmation: v.optional(v.boolean()),
		confirmationAddress: v.optional(v.string()),
		paymentMethod: v.optional(v.string()),
		setup: v.optional(v.string()),
		userId: v.optional(v.string()),
	},
	handler: async (
		ctx,
		args: {
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
	): Promise<{
		paymentIdentifier: string;
		signature: string;
		transactionId: string;
	}> => {
		const {
			PAYFAST_MERCHANT_ID,
			PAYFAST_MERCHANT_KEY,
			PAYFAST_PASSPHRASE,
			PAYFAST_SANDBOX,
			// biome-ignore lint/suspicious/noExplicitAny: action ctx lacks env
		} = (ctx as any).env as Env;

		if (PAYFAST_SANDBOX === "true") {
			throw new Error("Onsite payments are not available in sandbox mode");
		}

		const host = "www.payfast.co.za";
		const url = `https://${host}/onsite/process`;

		const fields: Record<string, string> = {
			merchant_id: PAYFAST_MERCHANT_ID,
			merchant_key: PAYFAST_MERCHANT_KEY,
			amount: args.amount.toFixed(2),
			item_name: args.itemName,
		};

		if (args.itemDescription) fields.item_description = args.itemDescription;
		if (args.mPaymentId) fields.m_payment_id = args.mPaymentId;
		if (args.returnUrl) fields.return_url = args.returnUrl;
		if (args.cancelUrl) fields.cancel_url = args.cancelUrl;
		if (args.notifyUrl) fields.notify_url = args.notifyUrl;
		if (args.emailConfirmation) fields.email_confirmation = "1";
		if (args.confirmationAddress)
			fields.confirmation_address = args.confirmationAddress;
		if (args.customInt1 !== undefined)
			fields.custom_int1 = String(args.customInt1);
		if (args.customInt2 !== undefined)
			fields.custom_int2 = String(args.customInt2);
		if (args.customInt3 !== undefined)
			fields.custom_int3 = String(args.customInt3);
		if (args.customInt4 !== undefined)
			fields.custom_int4 = String(args.customInt4);
		if (args.customInt5 !== undefined)
			fields.custom_int5 = String(args.customInt5);
		if (args.customStr1) fields.custom_str1 = args.customStr1;
		if (args.customStr2) fields.custom_str2 = args.customStr2;
		if (args.customStr3) fields.custom_str3 = args.customStr3;
		if (args.customStr4) fields.custom_str4 = args.customStr4;
		if (args.customStr5) fields.custom_str5 = args.customStr5;
		if (args.paymentMethod) fields.payment_method = args.paymentMethod;
		if (args.setup) fields.setup = args.setup;

		const signature = generateSignature(fields, PAYFAST_PASSPHRASE);
		fields.signature = signature;

		const body = new URLSearchParams(fields).toString();
		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body,
		});

		const responseText = await response.text();

		if (!response.ok) {
			throw new Error(
				`Onsite payment identifier request failed: ${response.status} ${responseText}`,
			);
		}

		let paymentIdentifier: string | null = null;
		try {
			const parsed = JSON.parse(responseText);
			paymentIdentifier = parsed.paymentIdentifier ?? null;
		} catch {
			paymentIdentifier = responseText.trim() || null;
		}

		if (!paymentIdentifier) {
			throw new Error(`No payment identifier returned: ${responseText}`);
		}

		const transactionId = (await ctx.runMutation(
			internal.lib._insertTransaction,
			{
				amount: args.amount,
				itemName: args.itemName,
				itemDescription: args.itemDescription,
				mPaymentId: args.mPaymentId,
				status: "PENDING",
				signature,
				userId: args.userId,
			},
		)) as string;

		return {
			paymentIdentifier,
			signature,
			transactionId,
		};
	},
});

export const processITN = mutation({
	args: { pfData: v.any() },
	returns: v.object({ status: v.string() }),
	// biome-ignore lint/suspicious/noExplicitAny: builder ctx type lacks env
	handler: async (ctx: any, args) => {
		return await handleITN(ctx, args.pfData as Record<string, string>);
	},
});

// biome-ignore lint/suspicious/noExplicitAny: handleITN uses ctx.db ops with values that may be undefined
async function handleITN(ctx: any, pfData: Record<string, string>) {
	const { PAYFAST_SANDBOX } = ctx.env;
	const host =
		PAYFAST_SANDBOX === "true" ? "sandbox.payfast.co.za" : "www.payfast.co.za";
	const url = `https://${host}/eng/query/validate`;
	const body = new URLSearchParams(pfData).toString();

	const response = await fetch(url, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body,
	});

	const validationResult = await response.text();

	if (validationResult !== "VALID") {
		await ctx.db.insert("itnLogs", {
			action: "validate",
			status: "INVALID",
			pfPaymentId: pfData.pf_payment_id
				? Number(pfData.pf_payment_id)
				: undefined,
			pfToken: pfData.token,
			errorMessage: `Validation failed: ${validationResult}`,
			pfData,
		});
		return { status: "INVALID" as const };
	}

	const pfPaymentId = pfData.pf_payment_id
		? Number(pfData.pf_payment_id)
		: undefined;
	const pfToken = pfData.token;
	const amount = Number.parseFloat(
		(pfData.amount_gross || pfData.amount) ?? "",
	);
	const itemName = pfData.item_name ?? "";
	const mPaymentId = pfData.m_payment_id;

	let transaction: Doc<"transactions"> | null = null;
	if (mPaymentId) {
		transaction = await ctx.db
			.query("transactions")
			// biome-ignore lint/suspicious/noExplicitAny: ctx is any so index query type can't be inferred
			.withIndex("mPaymentId", (q: any) => q.eq("mPaymentId", mPaymentId))
			.first();
	}

	if (transaction && pfToken) {
		const env = ctx.env as Env;
		const path = `/subscriptions/${encodeURIComponent(pfToken)}/adhoc`;
		const result = await callPayfastApi("POST", path, env, {
			bodyFields: { amount: transaction.amount.toFixed(2) },
			extraHeaders: { "x-payfast-subscription-type": "1" },
		});
		await ctx.db.insert("recurringLogs", {
			action: "charge_adhoc",
			pfToken,
			token: pfData.token || pfToken,
			status: result.ok ? "success" : "error",
			requestBody: `amount=${transaction.amount.toFixed(2)}`,
			responseBody: result.body,
			errorMessage: result.ok ? undefined : `HTTP ${result.status}`,
		});
	}

	const status = asTransactionStatus(
		pfData.pf_payment_status || pfData.payment_status,
	);
	const pfSubscriptionType = pfData.subscription_type;

	if (pfPaymentId) {
		const existingTx = await ctx.db
			.query("transactions")
			// biome-ignore lint/suspicious/noExplicitAny: ctx is any so index query type can't be inferred
			.withIndex("pfPaymentId", (q: any) => q.eq("pfPaymentId", pfPaymentId))
			.first();

		if (existingTx) {
			await ctx.db.patch(existingTx._id, {
				status,
				pfPaymentId,
				pfToken,
				token: pfData.token,
				billingDate: pfData.billing_date,
			});
		} else {
			await ctx.db.insert("transactions", {
				amount,
				itemName,
				itemDescription: pfData.item_description,
				mPaymentId,
				status,
				pfPaymentId,
				pfToken,
				token: pfData.token,
				billingDate: pfData.billing_date,
				signature: pfData.signature || "",
			});
		}
	}

	if (pfSubscriptionType) {
		const existingSub = pfToken
			? await ctx.db
					.query("subscriptions")
					// biome-ignore lint/suspicious/noExplicitAny: ctx is any so index query type can't be inferred
					.withIndex("token", (q: any) => q.eq("token", pfToken))
					.first()
			: null;

		if (existingSub) {
			await ctx.db.patch(existingSub._id, {
				status: pfData.subscription_status || existingSub.status,
				cyclesComplete: pfData.cycles_complete
					? Number(pfData.cycles_complete)
					: existingSub.cyclesComplete,
				nextRunDate: pfData.next_run_date || existingSub.nextRunDate,
			});
		} else if (pfToken) {
			await ctx.db.insert("subscriptions", {
				token: pfToken,
				status: pfData.subscription_status || "active",
				amount,
				cycles: pfData.cycles ? Number(pfData.cycles) : undefined,
				frequency: pfData.frequency ? Number(pfData.frequency) : undefined,
				cyclesComplete: pfData.cycles_complete
					? Number(pfData.cycles_complete)
					: undefined,
				runDate: pfData.billing_date,
				nextRunDate: pfData.next_run_date,
				itemName,
			});
		}
	}

	await ctx.db.insert("itnLogs", {
		action: "validate",
		status: "PROCESSED",
		pfPaymentId,
		pfToken,
		token: pfData.token,
		pfData,
	});

	return { status: "PROCESSED" as const };
}
