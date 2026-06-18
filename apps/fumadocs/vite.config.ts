import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import alchemy from "alchemy/cloudflare/tanstack-start";
import mdx from "fumadocs-mdx/vite";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

const alchemyConfigPath = fileURLToPath(
  new URL("./.alchemy/local/wrangler.jsonc", import.meta.url),
);
const shouldUseAlchemy = existsSync(alchemyConfigPath);

const cloudflareWorkersShimPath = fileURLToPath(
  new URL("../../packages/env/src/cloudflare-local.ts", import.meta.url),
);
const cloudflareWorkersAlias = shouldUseAlchemy
  ? {}
  : {
      "cloudflare:workers": cloudflareWorkersShimPath,
    };

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    tsconfigPaths: true,
    alias: cloudflareWorkersAlias,
  },
  plugins: [
    mdx(),
    tailwindcss(),
    tanstackStart({
      spa: {
        enabled: true,
        prerender: {
          enabled: true,
          crawlLinks: true,
        },
      },
      pages: [
        {
          path: "/docs",
        },
        {
          path: "/api/search",
        },
        {
          path: "llms-full.txt",
        },
        {
          path: "llms.txt",
        },
      ],
    }),
    react(),
    ...(shouldUseAlchemy
      ? [alchemy({ configPath: alchemyConfigPath })]
      : [nitro()]),
  ],
});
