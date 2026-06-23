import { api } from "@payfastt/backend/convex/_generated/api";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";

export const Route = createFileRoute("/transactions")({
	component: TransactionsPage,
});

function TransactionsPage() {
	const transactions = useQuery(api.payfast.listTransactions);

	return (
		<div className="container mx-auto max-w-4xl px-4 py-8">
			<h1 className="mb-6 font-bold text-2xl">Transactions</h1>

			{transactions === undefined ? (
				<p className="text-muted-foreground text-sm">Loading...</p>
			) : transactions.length === 0 ? (
				<p className="text-muted-foreground text-sm">No transactions yet.</p>
			) : (
				<div className="overflow-x-auto rounded-md border">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b bg-muted/50">
								<th className="px-4 py-2 text-left font-medium">ID</th>
								<th className="px-4 py-2 text-left font-medium">Item</th>
								<th className="px-4 py-2 text-right font-medium">Amount</th>
								<th className="px-4 py-2 text-center font-medium">Status</th>
								<th className="px-4 py-2 text-right font-medium">Date</th>
							</tr>
						</thead>
						<tbody>
							{transactions.map((tx: (typeof transactions)[number]) => (
								<tr key={tx._id} className="border-b last:border-0">
									<td className="px-4 py-2 font-mono text-xs">{tx._id}</td>
									<td className="px-4 py-2">{tx.itemName}</td>
									<td className="px-4 py-2 text-right">
										R{tx.amount.toFixed(2)}
									</td>
									<td className="px-4 py-2 text-center">
										<span
											className={`inline-block rounded-full px-2 py-0.5 font-medium text-xs ${
												tx.status === "COMPLETE"
													? "bg-green-100 text-green-800"
													: tx.status === "PENDING"
														? "bg-yellow-100 text-yellow-800"
														: tx.status === "CANCELLED"
															? "bg-red-100 text-red-800"
															: tx.status === "REFUNDED"
																? "bg-purple-100 text-purple-800"
																: "bg-gray-100 text-gray-800"
											}`}
										>
											{tx.status}
										</span>
									</td>
									<td className="px-4 py-2 text-right text-muted-foreground text-xs">
										{tx._creationTime
											? new Date(tx._creationTime).toLocaleDateString()
											: "-"}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
