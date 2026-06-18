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
import { md5 } from "./md5.js";
import { asTransactionStatus } from "./statuses.js";

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
		userId: v.optional(v.string()),
	},
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
	handler: async (ctx, args) => {
		const results = await ctx.db
			.query("subscriptions")
			.filter((q) => q.eq(q.field("token"), args.token))
			.collect();
		return results[0] ?? null;
	},
});

export const saveUserProfile = mutation({
	args: {
		userId: v.string(),
		email: v.optional(v.string()),
		name: v.optional(v.string()),
		metadata: v.optional(v.any()),
	},
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
	handler: async (ctx, args) => {
		return await ctx.db
			.query("userProfiles")
			.withIndex("userId", (q) => q.eq("userId", args.userId))
			.first();
	},
});

function buildRESTHeaders(
	body: string,
	merchantId: string,
	merchantKey: string,
	passphrase: string,
): Record<string, string> {
	const timestamp = new Date().toISOString();
	const data = `${merchantId}${merchantKey}${timestamp}${body}${passphrase}`;
	const signature = md5(data);
	return {
		"Content-Type": "application/x-www-form-urlencoded",
		"x-payfast-merchant-id": merchantId,
		"x-payfast-timestamp": timestamp,
		"x-payfast-signature": signature,
		"x-payfast-version": "v1",
	};
}

export const _getSubscriptionByToken = internalQuery({
	args: { token: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("subscriptions")
			.filter((q) => q.eq(q.field("token"), args.token))
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
	// biome-ignore lint/suspicious/noExplicitAny: builder ctx type lacks env
	ctx: any,
	token: string,
	action: string,
	opts?: { body?: string; userId?: string },
): Promise<{ success: boolean }> {
	const sub = await ctx.runQuery(internal.lib._getSubscriptionByToken, {
		token,
	});
	if (!sub) throw new Error(`Subscription not found: ${token}`);

	const {
		PAYFAST_SANDBOX,
		PAYFAST_MERCHANT_ID,
		PAYFAST_MERCHANT_KEY,
		PAYFAST_PASSPHRASE,
	} = ctx.env as Env;
	const host =
		PAYFAST_SANDBOX === "true" ? "sandbox.payfast.co.za" : "api.payfast.co.za";
	const url = `https://${host}/subscriptions/${encodeURIComponent(token)}/${action}`;
	const body = opts?.body ?? "";

	const response = await fetch(url, {
		method: "PUT",
		headers: buildRESTHeaders(
			body,
			PAYFAST_MERCHANT_ID,
			PAYFAST_MERCHANT_KEY,
			PAYFAST_PASSPHRASE,
		),
		...(body ? { body } : {}),
	});
	const responseBody = await response.text();

	await ctx.runMutation(internal.lib._addRecurringLog, {
		action,
		pfToken: token,
		token,
		status: response.ok ? "success" : "error",
		requestBody: body,
		responseBody,
		errorMessage: response.ok ? undefined : `HTTP ${response.status}`,
		userId: opts?.userId,
	});

	if (!response.ok) {
		throw new Error(
			`Failed to ${action} subscription: ${response.status} ${responseBody}`,
		);
	}

	return { success: true };
}

export const pauseSubscription = action({
	args: { token: v.string(), userId: v.optional(v.string()) },
	handler: async (ctx, args) => {
		return await callSubscriptionApi(ctx, args.token, "pause", {
			userId: args.userId,
		});
	},
});

export const unpauseSubscription = action({
	args: { token: v.string(), userId: v.optional(v.string()) },
	handler: async (ctx, args) => {
		return await callSubscriptionApi(ctx, args.token, "unpause", {
			userId: args.userId,
		});
	},
});

export const cancelSubscription = action({
	args: { token: v.string(), userId: v.optional(v.string()) },
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
	handler: async (ctx, args) => {
		const bodyParts: string[] = [];
		if (args.amount !== undefined)
			bodyParts.push(`amount=${args.amount.toFixed(2)}`);
		if (args.cycles !== undefined) bodyParts.push(`cycles=${args.cycles}`);
		if (args.frequency !== undefined)
			bodyParts.push(`frequency=${args.frequency}`);
		if (args.runDate) bodyParts.push(`run_date=${args.runDate}`);
		return await callSubscriptionApi(ctx, args.token, "update", {
			body: bodyParts.join("&"),
			userId: args.userId,
		});
	},
});

export const processITN = mutation({
	args: { pfData: v.any() },
	handler: async (ctx, args) => {
		return await handleITN(ctx, args.pfData as Record<string, string>);
	},
});

async function handleITN(
	// biome-ignore lint/suspicious/noExplicitAny: builder ctx type lacks env+db+fetch
	ctx: any,
	pfData: Record<string, string>,
) {
	const {
		PAYFAST_SANDBOX,
		PAYFAST_MERCHANT_ID,
		PAYFAST_MERCHANT_KEY,
		PAYFAST_PASSPHRASE,
	} = ctx.env as Env;
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
		const transactions = await ctx.db
			.query("transactions")
			// biome-ignore lint/suspicious/noExplicitAny: Convex filter q type is opaque
			.filter((q: any) => q.eq(q.field("mPaymentId"), mPaymentId))
			.collect();
		transaction = transactions[0] ?? null;
	}

	if (transaction && pfToken) {
		const billingBody = `amount=${transaction.amount.toFixed(2)}`;
		const result = await fetch(
			`https://${host}/subscriptions/${encodeURIComponent(pfToken)}/adhoc`,
			{
				method: "POST",
				headers: {
					...buildRESTHeaders(
						billingBody,
						PAYFAST_MERCHANT_ID,
						PAYFAST_MERCHANT_KEY,
						PAYFAST_PASSPHRASE,
					),
					"Content-Type": "application/x-www-form-urlencoded",
					"x-payfast-subscription-type": "1",
				},
				body: billingBody,
			},
		);
		const resultBody = await result.text();
		await ctx.db.insert("recurringLogs", {
			action: "charge_adhoc",
			pfToken,
			token: pfData.token || pfToken,
			status: result.ok ? "success" : "error",
			requestBody: billingBody,
			responseBody: resultBody,
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
			// biome-ignore lint/suspicious/noExplicitAny: Convex filter q type is opaque
			.filter((q: any) => q.eq(q.field("pfPaymentId"), pfPaymentId))
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
		const existingSub = await ctx.db
			.query("subscriptions")
			// biome-ignore lint/suspicious/noExplicitAny: Convex filter q type is opaque
			.filter((q: any) => q.eq(q.field("token"), pfToken))
			.first();

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
