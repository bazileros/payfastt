import type {
	ActionBuilder,
	GenericActionCtx,
	GenericDatabaseReader,
	GenericDatabaseWriter,
	GenericMutationCtx,
	GenericQueryCtx,
	HttpActionBuilder,
	MutationBuilder,
	QueryBuilder,
} from "convex/server";
import {
	actionGeneric,
	httpActionGeneric,
	internalActionGeneric,
	internalMutationGeneric,
	internalQueryGeneric,
	mutationGeneric,
	queryGeneric,
} from "convex/server";
import type { DataModel } from "./dataModel.js";

export type Env = {
	PAYFAST_MERCHANT_ID: string;
	PAYFAST_MERCHANT_KEY: string;
	PAYFAST_PASSPHRASE: string;
	PAYFAST_SANDBOX: string;
};

export const query: QueryBuilder<DataModel, "public"> = queryGeneric;

export const internalQuery: QueryBuilder<DataModel, "internal"> =
	internalQueryGeneric;

export const mutation: MutationBuilder<DataModel, "public"> = mutationGeneric;

export const internalMutation: MutationBuilder<DataModel, "internal"> =
	internalMutationGeneric;

export const action: ActionBuilder<DataModel, "public"> = actionGeneric;

export const internalAction: ActionBuilder<DataModel, "internal"> =
	internalActionGeneric;

export const httpAction: HttpActionBuilder = httpActionGeneric;

export type QueryCtx = GenericQueryCtx<DataModel> & { env: Env };

export type MutationCtx = GenericMutationCtx<DataModel> & { env: Env };

export type ActionCtx = GenericActionCtx<DataModel> & { env: Env };

export type DatabaseReader = GenericDatabaseReader<DataModel>;

export type DatabaseWriter = GenericDatabaseWriter<DataModel>;
