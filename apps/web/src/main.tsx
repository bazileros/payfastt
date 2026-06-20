import { PayfastProvider } from "@bazileros/payfast/react";
import { components } from "@payfastt/backend/convex/_generated/api";
import { env } from "@payfastt/env/web";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import ReactDOM from "react-dom/client";

import Loader from "./components/loader";
import { routeTree } from "./routeTree.gen";

const convex = new ConvexReactClient(env.VITE_CONVEX_URL);

const router = createRouter({
	routeTree,
	defaultPreload: "intent",
	scrollRestoration: true,
	defaultPendingComponent: () => <Loader />,
	context: {},
	Wrap: function WrapComponent({ children }: { children: React.ReactNode }) {
		return (
			<ConvexProvider client={convex}>
				<PayfastProvider component={components.payfast}>
					{children}
				</PayfastProvider>
			</ConvexProvider>
		);
	},
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const rootElement = document.getElementById("app");

if (!rootElement) {
	throw new Error("Root element not found");
}

if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(<RouterProvider router={router} />);
}
