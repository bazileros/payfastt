import { defineApp } from "convex/server";
import payfast from "@bazileros/payfast/convex.config";

const app = defineApp();

app.use(payfast);

export default app;
