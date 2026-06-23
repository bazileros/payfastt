import { httpRouter } from "convex/server";
import { api } from "./_generated/api.js";
import { httpAction } from "./_generated/server.js";
import { validateItnSourceIp } from "./ips.js";

export async function handleItn(
	env: { PAYFAST_SANDBOX: string; PAYFAST_PASSPHRASE: string },
	pfData: Record<string, string>,
	clientIp: string | null,
	runMutation: (args: { pfData: Record<string, string> }) => Promise<unknown>,
) {
	if (clientIp && !validateItnSourceIp(clientIp)) {
		return new Response("INVALID", { status: 200 });
	}

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
				parts.push(`${key}=${encodeURIComponent(value).replace(/%20/g, "+")}`);
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

	await runMutation({ pfData });

	return new Response("OK", { status: 200 });
}

function parseFormBody(text: string): Record<string, string> {
	const data: Record<string, string> = {};
	for (const part of text.split("&")) {
		const [key, value] = part.split("=");
		if (key && value !== undefined) {
			data[decodeURIComponent(key.replace(/\+/g, " "))] = decodeURIComponent(
				value.replace(/\+/g, " "),
			);
		}
	}
	return data;
}

const http = httpRouter();

http.route({
	path: "/itn",
	method: "POST",
	handler: httpAction(async (ctx, request) => {
		const env = (ctx as unknown as { env: Record<string, string> }).env as {
			PAYFAST_SANDBOX: string;
			PAYFAST_PASSPHRASE: string;
		};

		const text = await request.text();
		const pfData = parseFormBody(text);

		const clientIp =
			request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
			request.headers.get("x-real-ip") ??
			null;

		return handleItn(env, pfData, clientIp, (args) =>
			ctx.runMutation(api.lib.processITN, args),
		);
	}),
});

export default http;
