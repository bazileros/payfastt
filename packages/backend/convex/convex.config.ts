import payfast from "@bazileros/payfast/convex.config";
import { defineApp } from "convex/server";

const app = defineApp();

app.use(payfast);

export default app;
