import { describe, expect, test } from "vitest";
import { validateItnSourceIp } from "./ips.js";

describe("validateItnSourceIp", () => {
	test("allows IPs in the 197.97.145.144/28 range", () => {
		expect(validateItnSourceIp("197.97.145.144")).toBe(true);
		expect(validateItnSourceIp("197.97.145.145")).toBe(true);
		expect(validateItnSourceIp("197.97.145.158")).toBe(true);
		expect(validateItnSourceIp("197.97.145.159")).toBe(true);
	});

	test("rejects IPs outside the 197.97.145.144/28 range", () => {
		expect(validateItnSourceIp("197.97.145.143")).toBe(false);
		expect(validateItnSourceIp("197.97.145.160")).toBe(false);
		expect(validateItnSourceIp("197.97.145.0")).toBe(false);
	});

	test("allows IPs in the 41.74.179.192/27 range", () => {
		expect(validateItnSourceIp("41.74.179.192")).toBe(true);
		expect(validateItnSourceIp("41.74.179.193")).toBe(true);
		expect(validateItnSourceIp("41.74.179.222")).toBe(true);
		expect(validateItnSourceIp("41.74.179.223")).toBe(true);
	});

	test("rejects IPs outside the 41.74.179.192/27 range", () => {
		expect(validateItnSourceIp("41.74.179.191")).toBe(false);
		expect(validateItnSourceIp("41.74.179.224")).toBe(false);
	});

	test("allows IPs in the 102.216.36.0/28 range", () => {
		expect(validateItnSourceIp("102.216.36.0")).toBe(true);
		expect(validateItnSourceIp("102.216.36.1")).toBe(true);
		expect(validateItnSourceIp("102.216.36.14")).toBe(true);
		expect(validateItnSourceIp("102.216.36.15")).toBe(true);
	});

	test("allows IPs in the 102.216.36.128/28 range", () => {
		expect(validateItnSourceIp("102.216.36.128")).toBe(true);
		expect(validateItnSourceIp("102.216.36.129")).toBe(true);
		expect(validateItnSourceIp("102.216.36.142")).toBe(true);
		expect(validateItnSourceIp("102.216.36.143")).toBe(true);
	});

	test("allows explicitly listed IPs", () => {
		expect(validateItnSourceIp("144.126.193.139")).toBe(true);
	});

	test("rejects unknown IPs", () => {
		expect(validateItnSourceIp("127.0.0.1")).toBe(false);
		expect(validateItnSourceIp("10.0.0.1")).toBe(false);
		expect(validateItnSourceIp("192.168.1.1")).toBe(false);
		expect(validateItnSourceIp("8.8.8.8")).toBe(false);
	});

	test("rejects empty string", () => {
		expect(validateItnSourceIp("")).toBe(false);
	});

	test("rejects malformed IPs without throwing", () => {
		expect(validateItnSourceIp("not-an-ip")).toBe(false);
		expect(validateItnSourceIp("256.256.256.256")).toBe(false);
	});
});
