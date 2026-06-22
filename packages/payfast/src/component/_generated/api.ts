/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as functions__generated_api from "../functions/_generated/api.js";
import type * as functions__generated_server from "../functions/_generated/server.js";
import type * as functions_api from "../functions/api.js";
import type * as functions_http from "../functions/http.js";
import type * as functions_ips from "../functions/ips.js";
import type * as functions_lib from "../functions/lib.js";
import type * as functions_md5 from "../functions/md5.js";
import type * as functions_statuses from "../functions/statuses.js";
import type * as http from "../http.js";
import type * as types from "../types.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import { anyApi, componentsGeneric } from "convex/server";

const fullApi: ApiFromModules<{
  "functions/_generated/api": typeof functions__generated_api;
  "functions/_generated/server": typeof functions__generated_server;
  "functions/api": typeof functions_api;
  "functions/http": typeof functions_http;
  "functions/ips": typeof functions_ips;
  "functions/lib": typeof functions_lib;
  "functions/md5": typeof functions_md5;
  "functions/statuses": typeof functions_statuses;
  http: typeof http;
  types: typeof types;
}> = anyApi as any;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
> = anyApi as any;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
> = anyApi as any;

export const components = componentsGeneric() as unknown as {};
