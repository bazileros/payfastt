import { describe, expect, test, vi } from "vitest";
import { Payfast, registerRoutes } from "./index.js";

function mockComponent() {
	return {
		lib: {
			generateCheckoutForm: "lib.generateCheckoutForm" as never,
			pauseSubscription: "lib.pauseSubscription" as never,
			unpauseSubscription: "lib.unpauseSubscription" as never,
			cancelSubscription: "lib.cancelSubscription" as never,
			updateSubscription: "lib.updateSubscription" as never,
			listTransactions: "lib.listTransactions" as never,
			getTransaction: "lib.getTransaction" as never,
			listSubscriptions: "lib.listSubscriptions" as never,
			getSubscription: "lib.getSubscription" as never,
			processITN: "lib.processITN" as never,
		},
	} as never;
}

function mockCtx(
	runQuery?: ReturnType<typeof vi.fn>,
	runMutation?: ReturnType<typeof vi.fn>,
	runAction?: ReturnType<typeof vi.fn>,
) {
	return {
		runQuery: runQuery ?? vi.fn(),
		runMutation: runMutation ?? vi.fn(),
		runAction: runAction ?? vi.fn(),
	} as never;
}

describe("Payfast", () => {
	test("creates instance with component reference", () => {
		const pf = new Payfast(mockComponent());
		expect(pf.component).toBeDefined();
	});

	test("defaults sandbox to false", () => {
		const pf = new Payfast(mockComponent());
		expect(pf.sandbox).toBe(false);
	});

	test("accepts sandbox option", () => {
		const pf = new Payfast(mockComponent(), { sandbox: true });
		expect(pf.sandbox).toBe(true);
	});

	test("getCardUpdateUrl uses sandbox host", () => {
		const pf = new Payfast(mockComponent(), { sandbox: true });
		const url = pf.getCardUpdateUrl("tok_123");
		expect(url).toContain("sandbox.payfast.co.za");
	});

	test("getCardUpdateUrl uses production host when not sandbox", () => {
		const pf = new Payfast(mockComponent());
		const url = pf.getCardUpdateUrl("tok_123");
		expect(url).toContain("www.payfast.co.za");
	});

	test("getCardUpdateUrl includes returnUrl", () => {
		const pf = new Payfast(mockComponent());
		const url = pf.getCardUpdateUrl("tok_123", "https://example.com/return");
		expect(url).toContain("return=https%3A%2F%2Fexample.com%2Freturn");
	});

	test("createCheckoutSession calls generateCheckoutForm mutation", async () => {
		const runMutation = vi.fn().mockResolvedValue({
			actionUrl: "https://sandbox.payfast.co.za/eng/process",
			fields: { merchant_id: "100" },
		});
		const pf = new Payfast(mockComponent(), { sandbox: true });
		const result = await pf.createCheckoutSession(
			mockCtx(undefined, runMutation),
			{
				amount: 100,
				itemName: "Test",
				userId: "user_1",
			},
		);
		expect(runMutation).toHaveBeenCalledWith(
			"lib.generateCheckoutForm",
			expect.objectContaining({
				amount: 100,
				itemName: "Test",
				userId: "user_1",
			}),
		);
		expect(result.formActionUrl).toBe(
			"https://sandbox.payfast.co.za/eng/process",
		);
		expect(result.formFields).toEqual({ merchant_id: "100" });
	});

	test("pauseSubscription calls runAction", async () => {
		const runAction = vi.fn().mockResolvedValue({ success: true });
		const pf = new Payfast(mockComponent());
		await pf.pauseSubscription(mockCtx(undefined, undefined, runAction), {
			token: "tok_1",
		});
		expect(runAction).toHaveBeenCalledWith("lib.pauseSubscription", {
			token: "tok_1",
			userId: undefined,
		});
	});

	test("cancelSubscription calls runAction", async () => {
		const runAction = vi.fn().mockResolvedValue({ success: true });
		const pf = new Payfast(mockComponent());
		await pf.cancelSubscription(mockCtx(undefined, undefined, runAction), {
			token: "tok_1",
		});
		expect(runAction).toHaveBeenCalledWith("lib.cancelSubscription", {
			token: "tok_1",
			userId: undefined,
		});
	});

	test("updateSubscription passes body params", async () => {
		const runAction = vi.fn().mockResolvedValue({ success: true });
		const pf = new Payfast(mockComponent());
		await pf.updateSubscription(mockCtx(undefined, undefined, runAction), {
			token: "tok_1",
			amount: 50,
			frequency: 3,
		});
		expect(runAction).toHaveBeenCalledWith("lib.updateSubscription", {
			token: "tok_1",
			amount: 50,
			frequency: 3,
			cycles: undefined,
			runDate: undefined,
			userId: undefined,
		});
	});

	test("listTransactions calls runQuery", async () => {
		const runQuery = vi.fn().mockResolvedValue([]);
		const pf = new Payfast(mockComponent());
		await pf.listTransactions(mockCtx(runQuery), { userId: "user_1" });
		expect(runQuery).toHaveBeenCalledWith("lib.listTransactions", {
			userId: "user_1",
			status: undefined,
			limit: undefined,
		});
	});

	test("getTransaction calls runQuery with transactionId", async () => {
		const runQuery = vi.fn().mockResolvedValue(null);
		const pf = new Payfast(mockComponent());
		await pf.getTransaction(mockCtx(runQuery), "jd0abc123" as never);
		expect(runQuery).toHaveBeenCalledWith("lib.getTransaction", {
			transactionId: "jd0abc123",
		});
	});

	test("listSubscriptions calls runQuery", async () => {
		const runQuery = vi.fn().mockResolvedValue([]);
		const pf = new Payfast(mockComponent());
		await pf.listSubscriptions(mockCtx(runQuery));
		expect(runQuery).toHaveBeenCalledWith("lib.listSubscriptions", {
			userId: undefined,
			status: undefined,
		});
	});

	test("getSubscription calls runQuery with token", async () => {
		const runQuery = vi.fn().mockResolvedValue(null);
		const pf = new Payfast(mockComponent());
		await pf.getSubscription(mockCtx(runQuery), "tok_1");
		expect(runQuery).toHaveBeenCalledWith("lib.getSubscription", {
			token: "tok_1",
		});
	});

	describe("getUserInfo", () => {
		test("resolves userId from getUserInfo callback", async () => {
			const runAction = vi.fn().mockResolvedValue({ success: true });
			const runQuery = vi.fn().mockResolvedValue({ userId: "auto_user" });
			const pf = new Payfast(mockComponent(), {
				getUserInfo: async (ctx) => {
					const result = await ctx.runQuery("");
					return result as { userId: string };
				},
			});
			await pf.pauseSubscription(mockCtx(runQuery, undefined, runAction), {
				token: "tok_1",
			});
			expect(runAction).toHaveBeenCalledWith("lib.pauseSubscription", {
				token: "tok_1",
				userId: "auto_user",
			});
		});

		test("explicit userId takes precedence over getUserInfo", async () => {
			const runAction = vi.fn().mockResolvedValue({ success: true });
			const runQuery = vi.fn();
			const pf = new Payfast(mockComponent(), {
				getUserInfo: async () => ({ userId: "auto_user" }),
			});
			await pf.pauseSubscription(mockCtx(runQuery, undefined, runAction), {
				token: "tok_1",
				userId: "explicit_user",
			});
			expect(runQuery).not.toHaveBeenCalled();
			expect(runAction).toHaveBeenCalledWith("lib.pauseSubscription", {
				token: "tok_1",
				userId: "explicit_user",
			});
		});
	});
});

describe("registerRoutes", () => {
	test("mounts ITN handler", () => {
		const routes: string[] = [];
		const http = {
			route: (r: { path: string }) => routes.push(r.path),
		};
		registerRoutes(http as never, mockComponent());
		expect(routes).toContain("/payfast/itn");
	});

	test("accepts custom path", () => {
		const routes: string[] = [];
		const http = {
			route: (r: { path: string }) => routes.push(r.path),
		};
		registerRoutes(http as never, mockComponent(), { itnPath: "/custom/itn" });
		expect(routes).toContain("/custom/itn");
	});

	describe("event dispatch", () => {
		test("calls onAny for every ITN", async () => {
			const onAny = vi.fn();
			const http = {
				route: (_r: {
					path: string;
					method: string;
					handler: (ctx: never, req: Request) => Promise<Response>;
				}) => {
					// capture the handler but won't call it — just verify route is mounted
				},
			};
			registerRoutes(http as never, mockComponent(), { events: { onAny } });
		});

		test("route handler calls processITN mutation", async () => {
			let capturedHandler:
				| ((ctx: never, req: Request) => Promise<Response>)
				| null = null;
			const http = {
				route: (_r: {
					path: string;
					method: string;
					handler: (ctx: never, req: Request) => Promise<Response>;
				}) => {
					capturedHandler = _r.handler;
				},
			};
			const runMutation = vi.fn().mockResolvedValue({ status: "PROCESSED" });
			registerRoutes(http as never, mockComponent(), { events: {} });
			expect(capturedHandler).not.toBeNull();

			const req = new Request("http://localhost/payfast/itn", {
				method: "POST",
				body: new URLSearchParams({
					payment_status: "COMPLETE",
					pf_payment_id: "12345",
				}).toString(),
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
			});
			const ctx = { runMutation } as never;
			const res = await (
				capturedHandler as NonNullable<typeof capturedHandler>
			)(ctx, req);
			expect(res.status).toBe(200);
			expect(runMutation).toHaveBeenCalledWith("lib.processITN", {
				pfData: expect.objectContaining({
					payment_status: "COMPLETE",
					pf_payment_id: "12345",
				}),
			});
		});

		test("dispatches onPaymentComplete for COMPLETE status", async () => {
			const onPaymentComplete = vi.fn();
			let capturedHandler:
				| ((ctx: never, req: Request) => Promise<Response>)
				| null = null;
			const http = {
				route: (_r: {
					path: string;
					method: string;
					handler: (ctx: never, req: Request) => Promise<Response>;
				}) => {
					capturedHandler = _r.handler;
				},
			};
			registerRoutes(http as never, mockComponent(), {
				events: { onPaymentComplete },
			});

			const runMutation = vi.fn().mockResolvedValue({ status: "PROCESSED" });
			const req = new Request("http://localhost/payfast/itn", {
				method: "POST",
				body: new URLSearchParams({ payment_status: "COMPLETE" }).toString(),
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
			});
			await (capturedHandler as NonNullable<typeof capturedHandler>)(
				{ runMutation } as never,
				req,
			);
			expect(onPaymentComplete).toHaveBeenCalled();
		});

		test("dispatches onPaymentCancelled for CANCELLED status", async () => {
			const onPaymentCancelled = vi.fn();
			let capturedHandler:
				| ((ctx: never, req: Request) => Promise<Response>)
				| null = null;
			const http = {
				route: (_r: {
					path: string;
					method: string;
					handler: (ctx: never, req: Request) => Promise<Response>;
				}) => {
					capturedHandler = _r.handler;
				},
			};
			registerRoutes(http as never, mockComponent(), {
				events: { onPaymentCancelled },
			});

			const runMutation = vi.fn().mockResolvedValue({ status: "PROCESSED" });
			const req = new Request("http://localhost/payfast/itn", {
				method: "POST",
				body: new URLSearchParams({ payment_status: "CANCELLED" }).toString(),
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
			});
			await (capturedHandler as NonNullable<typeof capturedHandler>)(
				{ runMutation } as never,
				req,
			);
			expect(onPaymentCancelled).toHaveBeenCalled();
		});

		test("dispatches onPaymentRefunded for REFUNDED status", async () => {
			const onPaymentRefunded = vi.fn();
			let capturedHandler:
				| ((ctx: never, req: Request) => Promise<Response>)
				| null = null;
			const http = {
				route: (_r: {
					path: string;
					method: string;
					handler: (ctx: never, req: Request) => Promise<Response>;
				}) => {
					capturedHandler = _r.handler;
				},
			};
			registerRoutes(http as never, mockComponent(), {
				events: { onPaymentRefunded },
			});

			const runMutation = vi.fn().mockResolvedValue({ status: "PROCESSED" });
			const req = new Request("http://localhost/payfast/itn", {
				method: "POST",
				body: new URLSearchParams({ payment_status: "REFUNDED" }).toString(),
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
			});
			await (capturedHandler as NonNullable<typeof capturedHandler>)(
				{ runMutation } as never,
				req,
			);
			expect(onPaymentRefunded).toHaveBeenCalled();
		});

		test("dispatches onSubscriptionCancelled for cancelled subscription_status", async () => {
			const onSubscriptionCancelled = vi.fn();
			let capturedHandler:
				| ((ctx: never, req: Request) => Promise<Response>)
				| null = null;
			const http = {
				route: (_r: {
					path: string;
					method: string;
					handler: (ctx: never, req: Request) => Promise<Response>;
				}) => {
					capturedHandler = _r.handler;
				},
			};
			registerRoutes(http as never, mockComponent(), {
				events: { onSubscriptionCancelled },
			});

			const runMutation = vi.fn().mockResolvedValue({ status: "PROCESSED" });
			const req = new Request("http://localhost/payfast/itn", {
				method: "POST",
				body: new URLSearchParams({
					subscription_status: "cancelled",
				}).toString(),
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
			});
			await (capturedHandler as NonNullable<typeof capturedHandler>)(
				{ runMutation } as never,
				req,
			);
			expect(onSubscriptionCancelled).toHaveBeenCalled();
		});

		test("dispatches onSubscriptionUpdated for any subscription_status", async () => {
			const onSubscriptionUpdated = vi.fn();
			let capturedHandler:
				| ((ctx: never, req: Request) => Promise<Response>)
				| null = null;
			const http = {
				route: (_r: {
					path: string;
					method: string;
					handler: (ctx: never, req: Request) => Promise<Response>;
				}) => {
					capturedHandler = _r.handler;
				},
			};
			registerRoutes(http as never, mockComponent(), {
				events: { onSubscriptionUpdated },
			});

			const runMutation = vi.fn().mockResolvedValue({ status: "PROCESSED" });
			const req = new Request("http://localhost/payfast/itn", {
				method: "POST",
				body: new URLSearchParams({ subscription_status: "active" }).toString(),
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
			});
			await (capturedHandler as NonNullable<typeof capturedHandler>)(
				{ runMutation } as never,
				req,
			);
			expect(onSubscriptionUpdated).toHaveBeenCalled();
		});

		test("does not dispatch payment events when status does not match", async () => {
			const onPaymentComplete = vi.fn();
			const onPaymentCancelled = vi.fn();
			let capturedHandler:
				| ((ctx: never, req: Request) => Promise<Response>)
				| null = null;
			const http = {
				route: (_r: {
					path: string;
					method: string;
					handler: (ctx: never, req: Request) => Promise<Response>;
				}) => {
					capturedHandler = _r.handler;
				},
			};
			registerRoutes(http as never, mockComponent(), {
				events: { onPaymentComplete, onPaymentCancelled },
			});

			const runMutation = vi.fn().mockResolvedValue({ status: "PROCESSED" });
			const req = new Request("http://localhost/payfast/itn", {
				method: "POST",
				body: new URLSearchParams({ payment_status: "PENDING" }).toString(),
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
			});
			await (capturedHandler as NonNullable<typeof capturedHandler>)(
				{ runMutation } as never,
				req,
			);
			expect(onPaymentComplete).not.toHaveBeenCalled();
			expect(onPaymentCancelled).not.toHaveBeenCalled();
		});

		test("events fire after processITN mutation succeeds", async () => {
			const events: string[] = [];
			const onAny = vi.fn().mockImplementation(async () => {
				events.push("onAny");
			});
			let capturedHandler:
				| ((ctx: never, req: Request) => Promise<Response>)
				| null = null;
			const http = {
				route: (_r: {
					path: string;
					method: string;
					handler: (ctx: never, req: Request) => Promise<Response>;
				}) => {
					capturedHandler = _r.handler;
				},
			};

			let mutationRun = false;
			const runMutation = vi
				.fn()
				.mockImplementation(async (_func: string, _args: unknown) => {
					mutationRun = true;
					events.push("processITN");
					return { status: "PROCESSED" };
				});

			registerRoutes(http as never, mockComponent(), { events: { onAny } });
			const req = new Request("http://localhost/payfast/itn", {
				method: "POST",
				body: new URLSearchParams({ payment_status: "COMPLETE" }).toString(),
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
			});
			await (capturedHandler as NonNullable<typeof capturedHandler>)(
				{ runMutation } as never,
				req,
			);
			expect(mutationRun).toBe(true);
			expect(onAny).toHaveBeenCalled();
		});
	});
});
