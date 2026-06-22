import { describe, expect, test, vi } from "vitest";
import { callPayfastApi } from "./api.js";

const mockEnv = {
	PAYFAST_MERCHANT_ID: "100001",
	PAYFAST_MERCHANT_KEY: "key123",
	PAYFAST_PASSPHRASE: "passphrase",
	PAYFAST_SANDBOX: "true",
};

describe("callPayfastApi", () => {
	test("sends GET request to correct sandbox URL", async () => {
		const fetchMock = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValue(new Response("OK", { status: 200 }));

		await callPayfastApi("GET", "/transactions", mockEnv);

		expect(fetchMock).toHaveBeenCalledTimes(1);
		const [url, opts] = fetchMock.mock.calls[0] as [string, RequestInit];
		expect(url).toBe("https://sandbox.payfast.co.za/transactions");
		expect(opts.method).toBe("GET");
		expect(opts.headers).toMatchObject({
			"Content-Type": "application/x-www-form-urlencoded",
			"x-payfast-merchant-id": "100001",
			"x-payfast-merchant-key": "key123",
			"x-payfast-version": "v1",
		});

		fetchMock.mockRestore();
	});

	test("sends POST request with body fields", async () => {
		const fetchMock = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValue(new Response("OK", { status: 200 }));

		await callPayfastApi("POST", "/subscriptions/tok_123/adhoc", mockEnv, {
			bodyFields: { amount: "10000", item_name: "Test" },
		});

		const [url, opts] = fetchMock.mock.calls[0] as [string, RequestInit];
		expect(url).toBe(
			"https://sandbox.payfast.co.za/subscriptions/tok_123/adhoc",
		);
		expect(opts.method).toBe("POST");
		expect(opts.body).toBe("amount=10000&item_name=Test");

		const headers = opts.headers as Record<string, string>;
		expect(headers["x-payfast-signature"]).toBeTruthy();

		fetchMock.mockRestore();
	});

	test("uses production host when sandbox is false", async () => {
		const fetchMock = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValue(new Response("OK", { status: 200 }));

		await callPayfastApi("GET", "/transactions", {
			...mockEnv,
			PAYFAST_SANDBOX: undefined,
		});

		const [url] = fetchMock.mock.calls[0] as [string];
		expect(url).toBe("https://api.payfast.co.za/transactions");

		fetchMock.mockRestore();
	});

	test("uses custom apiHost when provided", async () => {
		const fetchMock = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValue(new Response("OK", { status: 200 }));

		await callPayfastApi("GET", "/transactions", mockEnv, {
			apiHost: "custom.host.com",
		});

		const [url] = fetchMock.mock.calls[0] as [string];
		expect(url).toBe("https://custom.host.com/transactions");

		fetchMock.mockRestore();
	});

	test("includes extra headers when provided", async () => {
		const fetchMock = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValue(new Response("OK", { status: 200 }));

		await callPayfastApi("GET", "/transactions", mockEnv, {
			extraHeaders: { "x-payfast-subscription-type": "1" },
		});

		const [, opts] = fetchMock.mock.calls[0] as [string, RequestInit];
		const headers = opts.headers as Record<string, string>;
		expect(headers["x-payfast-subscription-type"]).toBe("1");

		fetchMock.mockRestore();
	});

	test("returns response body and status", async () => {
		const fetchMock = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValue(
				new Response(JSON.stringify({ id: "abc" }), { status: 200 }),
			);

		const result = await callPayfastApi("GET", "/transactions", mockEnv);

		expect(result.ok).toBe(true);
		expect(result.status).toBe(200);
		expect(result.body).toBe(JSON.stringify({ id: "abc" }));

		fetchMock.mockRestore();
	});

	test("handles error responses", async () => {
		const fetchMock = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValue(new Response("Not Found", { status: 404 }));

		const result = await callPayfastApi("GET", "/transactions", mockEnv);

		expect(result.ok).toBe(false);
		expect(result.status).toBe(404);
		expect(result.body).toBe("Not Found");

		fetchMock.mockRestore();
	});

	test("builds valid REST API signature header", async () => {
		const fetchMock = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValue(new Response("OK", { status: 200 }));

		await callPayfastApi("POST", "/refunds", mockEnv, {
			bodyFields: { ptx_id: "12345", amount: "100.00" },
		});

		const [, opts] = fetchMock.mock.calls[0] as [string, RequestInit];
		const headers = opts.headers as Record<string, string>;

		expect(headers["x-payfast-signature"]).toBeTruthy();
		expect(headers["x-payfast-merchant-id"]).toBe("100001");
		expect(headers["x-payfast-merchant-key"]).toBe("key123");
		expect(headers["x-payfast-timestamp"]).toBeTruthy();
		expect(headers["x-payfast-version"]).toBe("v1");

		fetchMock.mockRestore();
	});
});
