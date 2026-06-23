import payfast from "@bazileros/payfast/convex.config";
import { defineApp } from "convex/server";
import { v } from "convex/values";

const app = defineApp({
	env: {
		PAYFAST_MERCHANT_ID: v.string(),
		PAYFAST_MERCHANT_KEY: v.string(),
		PAYFAST_PASSPHRASE: v.string(),
		PAYFAST_SANDBOX: v.string(),
	},
});

app.use(payfast, {
	env: {
		PAYFAST_MERCHANT_ID: app.env.PAYFAST_MERCHANT_ID,
		PAYFAST_MERCHANT_KEY: app.env.PAYFAST_MERCHANT_KEY,
		PAYFAST_PASSPHRASE: app.env.PAYFAST_PASSPHRASE,
		PAYFAST_SANDBOX: app.env.PAYFAST_SANDBOX,
	},
});

export default app;
