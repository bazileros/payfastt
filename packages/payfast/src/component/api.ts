import { md5 } from "./md5.js";
import type { Env } from "./_generated/server.js";

function urlEncode(value: string): string {
	return encodeURIComponent(value).replace(/%20/g, "+");
}

function buildRESTApiSignature(
	merchantId: string,
	timestamp: string,
	bodyFields: Record<string, string>,
	passphrase: string,
): string {
	const fields: Record<string, string> = {
		"merchant-id": merchantId,
		timestamp,
		version: "v1",
		passphrase,
	};

	for (const [key, value] of Object.entries(bodyFields)) {
		fields[key] = value;
	}

	const keys = Object.keys(fields).sort();
	const parts: string[] = [];
	for (const key of keys) {
		const value = fields[key];
		if (value !== undefined && value !== null && value !== "") {
			parts.push(`${key}=${urlEncode(value)}`);
		}
	}

	return md5(parts.join("&"));
}

function buildRESTHeaders(
	bodyFields: Record<string, string>,
	merchantId: string,
	merchantKey: string,
	passphrase: string,
): Record<string, string> {
	const timestamp = new Date().toISOString();
	const signature = buildRESTApiSignature(
		merchantId,
		timestamp,
		bodyFields,
		passphrase,
	);
	return {
		"Content-Type": "application/x-www-form-urlencoded",
		"x-payfast-merchant-id": merchantId,
		"x-payfast-merchant-key": merchantKey,
		"x-payfast-timestamp": timestamp,
		"x-payfast-signature": signature,
		"x-payfast-version": "v1",
	};
}

export type PayfastApiResponse = {
	ok: boolean;
	status: number;
	body: string;
};

export async function callPayfastApi(
	method: string,
	path: string,
	env: Env,
	opts?: {
		bodyFields?: Record<string, string>;
		extraHeaders?: Record<string, string>;
		apiHost?: string;
	},
): Promise<PayfastApiResponse> {
	const host =
		opts?.apiHost ??
		(env.PAYFAST_SANDBOX === "true"
			? "sandbox.payfast.co.za"
			: "api.payfast.co.za");
	const url = `https://${host}${path}`;
	const bodyFields = opts?.bodyFields ?? {};

	const headers = buildRESTHeaders(
		bodyFields,
		env.PAYFAST_MERCHANT_ID,
		env.PAYFAST_MERCHANT_KEY,
		env.PAYFAST_PASSPHRASE,
	);

	if (opts?.extraHeaders) {
		Object.assign(headers, opts.extraHeaders);
	}

	const body = Object.keys(bodyFields).length > 0
		? new URLSearchParams(bodyFields).toString()
		: undefined;

	const response = await fetch(url, {
		method,
		headers,
		body,
	});

	return {
		ok: response.ok,
		status: response.status,
		body: await response.text(),
	};
}
