import { afterEach, describe, expect, test, vi } from "vitest";
import { handleItn } from "./http.js";
import { md5 } from "./md5.js";

const env = {
	PAYFAST_SANDBOX: "true",
	PAYFAST_PASSPHRASE: "testpass",
};

afterEach(() => {
	vi.restoreAllMocks();
});

describe("handleItn", () => {
	test("returns INVALID when IP validation rejects", async () => {
		const res = await handleItn(env, {}, "192.0.2.1", vi.fn());
		expect(res.status).toBe(200);
		expect(await res.text()).toBe("INVALID");
	});

	test("skips IP check when no client IP provided", async () => {
		const fetchMock = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValue(new Response("VALID"));
		const runMutation = vi.fn();
		const res = await handleItn(env, {}, null, runMutation);
		expect(res.status).toBe(200);
		expect(await res.text()).toBe("OK");
		expect(runMutation).toHaveBeenCalledTimes(1);
		fetchMock.mockRestore();
	});

	test("returns INVALID when echo-back returns not VALID", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("INVALID"));
		const res = await handleItn(env, {}, null, vi.fn());
		expect(res.status).toBe(200);
		expect(await res.text()).toBe("INVALID");
	});

	test("returns INVALID when signature does not match", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("VALID"));
		const res = await handleItn(
			env,
			{ pf_payment_id: "123", signature: "wrongsig" },
			null,
			vi.fn(),
		);
		expect(res.status).toBe(200);
		expect(await res.text()).toBe("INVALID");
	});

	test("calls runMutation and returns OK on valid request without signature", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("VALID"));
		const runMutation = vi.fn();
		const res = await handleItn(
			env,
			{ pf_payment_id: "123", amount: "100" },
			null,
			runMutation,
		);
		expect(res.status).toBe(200);
		expect(await res.text()).toBe("OK");
		expect(runMutation).toHaveBeenCalledWith({
			pfData: { pf_payment_id: "123", amount: "100" },
		});
	});

	test("returns OK when signature matches", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("VALID"));
		const runMutation = vi.fn();
		const raw = "amount=100&pf_payment_id=123&passphrase=testpass";
		const pfData = {
			amount: "100",
			pf_payment_id: "123",
			signature: md5(raw),
		};
		const res = await handleItn(env, pfData, null, runMutation);
		expect(res.status).toBe(200);
		expect(await res.text()).toBe("OK");
		expect(runMutation).toHaveBeenCalledWith({ pfData });
	});

	test("uses production host when sandbox is false", async () => {
		const fetchMock = vi
			.spyOn(globalThis, "fetch")
			.mockImplementation(async (url: string) => {
				expect(url).toContain("www.payfast.co.za");
				return new Response("VALID");
			});
		const res = await handleItn(
			{ ...env, PAYFAST_SANDBOX: "false" },
			{ pf_payment_id: "123" },
			null,
			vi.fn(),
		);
		expect(res.status).toBe(200);
		expect(await res.text()).toBe("OK");
		fetchMock.mockRestore();
	});
});
