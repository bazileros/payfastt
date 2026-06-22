import type { GenericSchema, SchemaDefinition } from "convex/server";
import type { TestConvex } from "convex-test";
import schema from "./component/functions/schema.js";

const modules = import.meta.glob("./component/functions/**/*.ts");

export function register(
	t: TestConvex<SchemaDefinition<GenericSchema, boolean>>,
	name = "payfast",
) {
	t.registerComponent(name, schema, modules);
}

export default { register, schema, modules };
