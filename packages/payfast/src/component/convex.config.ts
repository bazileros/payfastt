import { defineComponent } from "convex/server";
import { v } from "convex/values";

export default defineComponent("payfast", {
	env: {
		PAYFAST_MERCHANT_ID: v.string(),
		PAYFAST_MERCHANT_KEY: v.string(),
		PAYFAST_PASSPHRASE: v.string(),
		PAYFAST_SANDBOX: v.string(),
	},
});
