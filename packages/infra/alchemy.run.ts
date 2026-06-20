import alchemy from "alchemy";
import { Astro, Vite } from "alchemy/cloudflare";
import { config } from "dotenv";

config({ path: "./.env" });
config({ path: "../../apps/web/.env" });

const app = await alchemy("payfastt");

const env = alchemy.env;

if (!env.VITE_CONVEX_URL) {
  throw new Error(
    "VITE_CONVEX_URL is not set. Please set it in your .env file or in the environment variables.",
  );
}
export const web = await Vite("web", {
  cwd: "../../apps/web",
  bindings: {
    VITE_CONVEX_URL: env.VITE_CONVEX_URL,
  },
});

export const docs = await Astro("docs", {
  cwd: "../../apps/docs",
  entrypoint: "dist/server/entry.mjs",
  assets: "dist/client",
});

console.log(`Web   -> ${web.url}`);
console.log(`Docs  -> ${docs.url}`);
await app.finalize();
