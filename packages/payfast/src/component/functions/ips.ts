/**
 * PayFast ITN source IP whitelist.
 *
 * Official ranges from https://developers.payfast.co.za/docs
 * under "Ports and IP Addresses".
 */

export const PAYFAST_ITN_CIDRS: string[] = [
	"197.97.145.144/28",
	"41.74.179.192/27",
	"102.216.36.0/28",
	"102.216.36.128/28",
];

export const PAYFAST_ITN_IPS: string[] = ["144.126.193.139"];

function ipToInt(ip: string): number {
	const parts = ip.split(".");
	return (
		((Number(parts[0]) << 24) |
			(Number(parts[1]) << 16) |
			(Number(parts[2]) << 8) |
			Number(parts[3])) >>>
		0
	);
}

function ipInCidr(ip: string, cidr: string): boolean {
	const parts = cidr.split("/");
	const rangeIp = parts[0] ?? "";
	const bits = Number(parts[1]);
	const ipInt = ipToInt(ip);
	const rangeInt = ipToInt(rangeIp);
	const mask = ~(2 ** (32 - bits) - 1) >>> 0;
	return (ipInt & mask) === (rangeInt & mask);
}

export function validateItnSourceIp(ip: string): boolean {
	for (const cidr of PAYFAST_ITN_CIDRS) {
		if (ipInCidr(ip, cidr)) return true;
	}
	for (const allowedIp of PAYFAST_ITN_IPS) {
		if (ip === allowedIp) return true;
	}
	return false;
}
