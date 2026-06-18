import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import schema from "./schema.js";
import { api } from "./_generated/api.js";
import { register } from "../test.js";

const modules = import.meta.glob("./**/*.ts");

function t() {
	const instance = convexTest({ schema, modules });
	register(instance, "payfast");
	return instance;
}

describe("saveUserProfile / getUserProfile", () => {
	test("inserts a new user profile", async () => {
		const instance = t();
		const id = await instance.mutation(api.lib.saveUserProfile, {
			userId: "user_1",
			email: "alice@example.com",
			name: "Alice",
		});
		expect(id).toBeTruthy();

		const profile = await instance.query(api.lib.getUserProfile, {
			userId: "user_1",
		});
		expect(profile).not.toBeNull();
		expect(profile?.email).toBe("alice@example.com");
		expect(profile?.name).toBe("Alice");
	});

	test("updates an existing user profile", async () => {
		const instance = t();
		await instance.mutation(api.lib.saveUserProfile, {
			userId: "user_1",
			email: "old@example.com",
		});
		await instance.mutation(api.lib.saveUserProfile, {
			userId: "user_1",
			email: "new@example.com",
			name: "Alice",
		});

		const profile = await instance.query(api.lib.getUserProfile, {
			userId: "user_1",
		});
		expect(profile?.email).toBe("new@example.com");
		expect(profile?.name).toBe("Alice");
	});

	test("returns null for non-existent user", async () => {
		const instance = t();
		const profile = await instance.query(api.lib.getUserProfile, {
			userId: "nonexistent",
		});
		expect(profile).toBeNull();
	});
});

describe("listTransactions / getTransaction", () => {
	test("lists transactions for a user", async () => {
		const instance = t();
		await instance.run(async (ctx) => {
			await ctx.db.insert("transactions", {
				amount: 100,
				itemName: "Donation",
				status: "COMPLETE",
				signature: "sig1",
				userId: "user_1",
			});
			await ctx.db.insert("transactions", {
				amount: 50,
				itemName: "T-shirt",
				status: "PENDING",
				signature: "sig2",
				userId: "user_1",
			});
			await ctx.db.insert("transactions", {
				amount: 200,
				itemName: "Other",
				status: "COMPLETE",
				signature: "sig3",
				userId: "user_2",
			});
		});

		const user1 = await instance.query(api.lib.listTransactions, {
			userId: "user_1",
		});
		expect(user1).toHaveLength(2);
		expect(user1.every((t) => t.userId === "user_1")).toBe(true);
	});

	test("filters by status", async () => {
		const instance = t();
		await instance.run(async (ctx) => {
			await ctx.db.insert("transactions", {
				amount: 100,
				itemName: "A",
				status: "COMPLETE",
				signature: "sig1",
			});
			await ctx.db.insert("transactions", {
				amount: 50,
				itemName: "B",
				status: "PENDING",
				signature: "sig2",
			});
		});

		const completed = await instance.query(api.lib.listTransactions, {
			status: "COMPLETE",
		});
		expect(completed).toHaveLength(1);
		expect(completed[0]?.status).toBe("COMPLETE");
	});

	test("limits results", async () => {
		const instance = t();
		await instance.run(async (ctx) => {
			for (let i = 0; i < 10; i++) {
				await ctx.db.insert("transactions", {
					amount: i + 1,
					itemName: `Item ${i}`,
					status: "PENDING",
					signature: `sig${i}`,
				});
			}
		});

		const limited = await instance.query(api.lib.listTransactions, {
			limit: 3,
		});
		expect(limited).toHaveLength(3);
	});

	test("getTransaction returns a single transaction", async () => {
		const instance = t();
		const _id = await instance.run(async (ctx) => {
			return await ctx.db.insert("transactions", {
				amount: 99,
				itemName: "Book",
				status: "COMPLETE",
				signature: "sig",
			});
		});
		const tx = await instance.query(api.lib.getTransaction, {
			transactionId: _id,
		});
		expect(tx).not.toBeNull();
		expect(tx?.itemName).toBe("Book");
		expect(tx?.amount).toBe(99);
	});
});

describe("listSubscriptions / getSubscription", () => {
	test("lists subscriptions for a user", async () => {
		const instance = t();
		await instance.run(async (ctx) => {
			await ctx.db.insert("subscriptions", {
				token: "tok_1",
				status: "active",
				itemName: "Monthly",
				amount: 50,
				userId: "user_1",
			});
			await ctx.db.insert("subscriptions", {
				token: "tok_2",
				status: "cancelled",
				itemName: "Yearly",
				amount: 500,
				userId: "user_1",
			});
		});

		const subs = await instance.query(api.lib.listSubscriptions, {
			userId: "user_1",
		});
		expect(subs).toHaveLength(2);
	});

	test("filters subscriptions by status", async () => {
		const instance = t();
		await instance.run(async (ctx) => {
			await ctx.db.insert("subscriptions", {
				token: "tok_1",
				status: "active",
				itemName: "Monthly",
			});
			await ctx.db.insert("subscriptions", {
				token: "tok_2",
				status: "cancelled",
				itemName: "Yearly",
			});
		});

		const active = await instance.query(api.lib.listSubscriptions, {
			status: "active",
		});
		expect(active).toHaveLength(1);
		expect(active[0]?.token).toBe("tok_1");
	});

	test("getSubscription returns by token", async () => {
		const instance = t();
		await instance.run(async (ctx) => {
			await ctx.db.insert("subscriptions", {
				token: "tok_unique",
				status: "active",
				itemName: "Pro Plan",
				amount: 99,
			});
		});

		const sub = await instance.query(api.lib.getSubscription, {
			token: "tok_unique",
		});
		expect(sub).not.toBeNull();
		expect(sub?.itemName).toBe("Pro Plan");
		expect(sub?.amount).toBe(99);
	});

	test("getSubscription returns null for unknown token", async () => {
		const instance = t();
		const sub = await instance.query(api.lib.getSubscription, {
			token: "nonexistent",
		});
		expect(sub).toBeNull();
	});
});
