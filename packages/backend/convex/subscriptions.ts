import { v } from "convex/values";
import { components } from "./_generated/api";
import { action, query } from "./_generated/server";

export const list = query({
	args: {
		userId: v.string(),
	},
	handler: async (ctx, args) => {
		return await ctx.runQuery(components.payfast.lib.listSubscriptions, {
			userId: args.userId,
		});
	},
});

export const cancel = action({
	args: { token: v.string() },
	handler: async (ctx, args) => {
		return await ctx.runAction(components.payfast.lib.cancelSubscription, {
			token: args.token,
		});
	},
});

export const pause = action({
	args: { token: v.string() },
	handler: async (ctx, args) => {
		return await ctx.runAction(components.payfast.lib.pauseSubscription, {
			token: args.token,
		});
	},
});

export const unpause = action({
	args: { token: v.string() },
	handler: async (ctx, args) => {
		return await ctx.runAction(components.payfast.lib.unpauseSubscription, {
			token: args.token,
		});
	},
});
