import { registerRoutes } from "@bazileros/payfast";
import { httpRouter } from "convex/server";
import { components } from "./_generated/api.js";

const http = httpRouter();

registerRoutes(http, components.payfast, {
	events: {
		onPaymentComplete: async (_ctx, _pfData) => {
			// Example: grant access after successful payment
			// await ctx.runMutation(api.myApp.grantAccess, {
			//   userId: pfData.m_payment_id,
			// });
		},
		onPaymentCancelled: async (_ctx, _pfData) => {
			// Example: notify user of cancelled payment
		},
		onSubscriptionCancelled: async (_ctx, _pfData) => {
			// Example: revoke access when subscription cancels
		},
	},
});

export default http;
