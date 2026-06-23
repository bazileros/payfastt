import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";

export default defineConfig({
	site: "https://pfdocs.surestrat.xyz",
	output: "server",
	adapter: cloudflare({
		configPath: "wrangler.jsonc",
		prerenderEnvironment: "node",
	}),
	integrations: [
		starlight({
			title: "PayFast Docs",
			logo: {
				src: "./public/Payfast-logo.svg",
				alt: "PayFast",
				replacesTitle: true,
			},
			head: [
				{
					tag: "link",
					attrs: {
						rel: "preconnect",
						href: "https://fonts.googleapis.com",
					},
				},
				{
					tag: "link",
					attrs: {
						rel: "preconnect",
						href: "https://fonts.gstatic.com",
						crossorigin: true,
					},
				},
				{
					tag: "link",
					attrs: {
						href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@400;500;600;700&display=swap",
						rel: "stylesheet",
					},
				},
			],
			social: [
				{
					icon: "github",
					label: "GitHub",
					href: "https://github.com/bazileros/payfastt",
				},
			],
			customCss: ["./src/styles/theme.css"],
			components: {
				Hero: "./src/components/overrides/Hero.astro",
				Footer: "./src/components/overrides/Footer.astro",
			},
			disable404Route: true,
			lastUpdated: true,
			pagination: true,
			editLink: {
				baseUrl: "https://github.com/bazileros/payfastt/edit/main/apps/docs/",
			},
			sidebar: [
				{
					label: "Getting Started",
					items: [
						{ label: "Overview", slug: "payfast" },
						{ label: "Installation", slug: "payfast/installation" },
					],
				},
				{
					label: "Guides",
					items: [
						{ label: "One-time Payments", slug: "payfast/checkout" },
						{ label: "Subscriptions", slug: "payfast/subscriptions" },
						{ label: "ITN Webhooks", slug: "payfast/itn-webhooks" },
						{ label: "Split Payments", slug: "payfast/split-payments" },
					],
				},
				{
					label: "Framework Guides",
					items: [
						{ label: "Next.js App Router", slug: "payfast/framework-nextjs" },
						{ label: "Vite + React", slug: "payfast/framework-vite" },
						{ label: "TanStack Router", slug: "payfast/framework-tanstack" },
						{
							label: "TanStack Start",
							slug: "payfast/framework-tanstack-start",
						},
						{
							label: "React Native / Expo",
							slug: "payfast/framework-react-native",
						},
					],
				},
				{
					label: "Reference",
					items: [
						{ label: "React Hooks", slug: "payfast/react-hooks" },
						{ label: "Server-side API", slug: "payfast/server-side" },
						{ label: "Best Practices", slug: "payfast/best-practices" },
						{ label: "Changelog", slug: "payfast/changelog" },
					],
				},
			],
		}),
		sitemap({
			filter: (page) => !page.includes("/404"),
		}),
	],
});
