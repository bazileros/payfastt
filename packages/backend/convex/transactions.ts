import { v } from "convex/values";
import { components } from "./_generated/api";
import { query } from "./_generated/server";

export const list = query({
	args: {
		userId: v.string(),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		return await ctx.runQuery(components.payfast.lib.listTransactions, {
			userId: args.userId,
			limit: args.limit ?? 50,
		});
	},
});

export const get = query({
	args: { transactionId: v.id("payfast_transactions") },
	handler: async (ctx, args) => {
		return await ctx.runQuery(components.payfast.lib.getTransaction, {
			transactionId: args.transactionId,
		});
	},
});
