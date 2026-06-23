import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	server: {
		port: 3001,
	},
	resolve: {
		alias: {
			"@bazileros/payfast": path.resolve(
				__dirname,
				"../../packages/payfast/dist",
			),
		},
		tsconfigPaths: true,
	},
	plugins: [
		tailwindcss(),
		tanstackRouter({
			target: "react",
			autoCodeSplitting: true,
		}),
		react(),
	],
	build: {
		rollupOptions: {
			output: {
				codeSplitting: {
					groups: [
						{
							name: "vendor-react",
							test: /node_modules[\\/](react|react-dom|scheduler)/,
							priority: 20,
						},
						{
							name: "vendor-router",
							test: /node_modules[\\/]@tanstack/,
							priority: 15,
						},
						{
							name: "vendor",
							test: /node_modules/,
							priority: 10,
						},
					],
				},
			},
		},
	},
});
