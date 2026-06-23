import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { components } from "./_generated/api";

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
	},
	handler: async (ctx, args) => {
		return ctx.runMutation(components.payfast.lib.generateCheckoutForm, args);
	},
});

export const listTransactions = query({
	args: {
		userId: v.optional(v.string()),
		status: v.optional(v.string()),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		return ctx.runQuery(components.payfast.lib.listTransactions, args);
	},
});

export const getTransaction = query({
	args: { transactionId: v.id("transactions") },
	handler: async (ctx, args) => {
		return ctx.runQuery(components.payfast.lib.getTransaction, args);
	},
});

export const listSubscriptions = query({
	args: {
		userId: v.optional(v.string()),
		status: v.optional(v.string()),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		return ctx.runQuery(components.payfast.lib.listSubscriptions, args);
	},
});

export const getSubscription = query({
	args: { token: v.string() },
	handler: async (ctx, args) => {
		return ctx.runQuery(components.payfast.lib.getSubscription, args);
	},
});

export const pauseSubscription = action({
	args: { token: v.string(), userId: v.optional(v.string()) },
	handler: async (ctx, args) => {
		return ctx.runAction(components.payfast.lib.pauseSubscription, args);
	},
});

export const unpauseSubscription = action({
	args: { token: v.string(), userId: v.optional(v.string()) },
	handler: async (ctx, args) => {
		return ctx.runAction(components.payfast.lib.unpauseSubscription, args);
	},
});

export const cancelSubscription = action({
	args: { token: v.string(), userId: v.optional(v.string()) },
	handler: async (ctx, args) => {
		return ctx.runAction(components.payfast.lib.cancelSubscription, args);
	},
});

export const updateSubscription = action({
	args: {
		token: v.string(),
		amount: v.optional(v.number()),
		frequency: v.optional(v.number()),
		cycles: v.optional(v.number()),
		runDate: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		return ctx.runAction(components.payfast.lib.updateSubscription, args);
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
	},
	handler: async (ctx, args) => {
		return ctx.runAction(components.payfast.lib.chargeSubscriptionAdhoc, args);
	},
});

export const refundTransaction = action({
	args: { ptxId: v.string(), amount: v.optional(v.number()) },
	handler: async (ctx, args) => {
		return ctx.runAction(components.payfast.lib.refundTransaction, args);
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
	},
	handler: async (ctx, args) => {
		return ctx.runAction(
			components.payfast.lib.generateOnsitePaymentIdentifier,
			args,
		);
	},
});
