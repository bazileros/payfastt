import { httpRouter } from "convex/server";
import { api } from "./_generated/api.js";
import { httpAction } from "./_generated/server.js";

const http = httpRouter();

http.route({
	path: "/itn",
	method: "POST",
	handler: httpAction(async (ctx, request) => {
		const text = await request.text();
		const pfData: Record<string, string> = {};
		for (const part of text.split("&")) {
			const [key, value] = part.split("=");
			if (key && value !== undefined) {
				pfData[decodeURIComponent(key.replace(/\+/g, " "))] =
					decodeURIComponent(value.replace(/\+/g, " "));
			}
		}

		// biome-ignore lint/suspicious/noExplicitAny: httpAction ctx lacks env
		const env = (ctx as any).env as {
			PAYFAST_SANDBOX: string;
			PAYFAST_PASSPHRASE: string;
		};
		const sandbox = env.PAYFAST_SANDBOX === "true";
		const host = sandbox ? "sandbox.payfast.co.za" : "www.payfast.co.za";
		const validateUrl = `https://${host}/eng/query/validate`;
		const body = new URLSearchParams(pfData).toString();

		const response = await fetch(validateUrl, {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body,
		});

		const validationResult = await response.text();

		if (validationResult !== "VALID") {
			return new Response("INVALID", { status: 200 });
		}

		const ourSignature = pfData.signature;
		if (ourSignature) {
			const keys = Object.keys(pfData)
				.filter((k) => k !== "signature")
				.sort();
			const parts: string[] = [];
			for (const key of keys) {
				const value = pfData[key];
				if (value !== undefined && value !== null && value !== "") {
					parts.push(
						`${key}=${encodeURIComponent(value).replace(/%20/g, "+")}`,
					);
				}
			}
			const passphrase = env.PAYFAST_PASSPHRASE;
			let raw = parts.join("&");
			if (passphrase) {
				raw += `&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, "+")}`;
			}
			const { md5 } = await import("./md5.js");
			const computedSignature = md5(raw);
			if (computedSignature !== ourSignature) {
				return new Response("INVALID", { status: 200 });
			}
		}

		await ctx.runMutation(api.lib.processITN, { pfData });

		return new Response("OK", { status: 200 });
	}),
});

export default http;
