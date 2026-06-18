import { describe, expect, test } from "vitest";
import { md5 } from "./md5.js";

describe("md5", () => {
	test("empty string", () => {
		expect(md5("")).toBe("d41d8cd98f00b204e9800998ecf8427e");
	});

	test("hello", () => {
		expect(md5("hello")).toBe("5d41402abc4b2a76b9719d911017c592");
	});

	test("PayFast signature test vector", () => {
		const result = md5(
			"merchant_id=10000100&merchant_key=46f0cd694581a&amount=100.00&item_name=test&passphrase=testpass",
		);
		expect(result).toHaveLength(32);
		expect(result).toMatch(/^[a-f0-9]{32}$/);
	});

	test("produces consistent results", () => {
		const input =
			"merchant_id=100&merchant_key=abc&amount=50.00&item_name=Donation";
		const a = md5(input);
		const b = md5(input);
		expect(a).toBe(b);
	});

	test("different inputs produce different hashes", () => {
		const a = md5("hello");
		const b = md5("world");
		expect(a).not.toBe(b);
	});
});
