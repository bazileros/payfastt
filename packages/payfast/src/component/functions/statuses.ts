export const TRANSACTION_STATUSES = [
	"COMPLETE",
	"PENDING",
	"PROCESSING",
	"CANCELLED",
	"OVERDUE",
	"REFUNDED",
	"UNKNOWN",
] as const;

export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];

export const SUBSCRIPTION_STATUSES = [
	"active",
	"paused",
	"cancelled",
	"completed",
	"suspended",
	"expired",
] as const;

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export const ITN_LOG_STATUSES = ["PROCESSED", "INVALID", "ERROR"] as const;

export type ItnLogStatus = (typeof ITN_LOG_STATUSES)[number];

export const PAYMENT_METHODS = [
	"cc",
	"dc",
	"mt",
	"mp",
	"sc",
	"ew",
	"av",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export function asTransactionStatus(
	raw: string | undefined,
): TransactionStatus {
	for (const s of TRANSACTION_STATUSES) {
		if (s === raw) return s;
	}
	return "UNKNOWN";
}
