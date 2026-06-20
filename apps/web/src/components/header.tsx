import { Link } from "@tanstack/react-router";

import { ModeToggle } from "./mode-toggle";

const links = [
	{ to: "/", label: "Home" },
	{ to: "/checkout", label: "Checkout" },
	{ to: "/transactions", label: "Transactions" },
	{ to: "/subscriptions", label: "Subscriptions" },
] as const;

export default function Header() {
	return (
		<div>
			<div className="flex flex-row items-center justify-between px-2 py-1">
				<nav className="flex gap-4 text-lg">
					{links.map(({ to, label }) => {
						return (
							<Link
								key={to}
								to={to}
								activeProps={{ className: "font-bold underline" }}
							>
								{label}
							</Link>
						);
					})}
				</nav>
				<div className="flex items-center gap-2">
					<ModeToggle />
				</div>
			</div>
			<hr />
		</div>
	);
}
