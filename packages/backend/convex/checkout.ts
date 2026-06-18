import { v } from "convex/values";
import { action } from "./_generated/server";
import { components } from "./_generated/api";

export const generateCheckoutForm = action({
	args: {
		amount: v.number(),
		itemName: v.string(),
		userId: v.string(),
		subscription: v.optional(
			v.object({
				frequency: v.union(
					v.literal("Monthly"),
					v.literal("Quarterly"),
					v.literal("Biannually"),
					v.literal("Annual"),
				),
				cycles: v.number(),
			}),
		),
	},
	handler: async (ctx, args) => {
		return await ctx.runAction(components.payfast.lib.generateCheckoutForm, {
			amount: args.amount,
			itemName: args.itemName,
			userId: args.userId,
			subscription: args.subscription,
		});
	},
});
