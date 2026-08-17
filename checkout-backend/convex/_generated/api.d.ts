/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as checkout from "../checkout.js";
import type * as crons from "../crons.js";
import type * as dispatcher from "../dispatcher.js";
import type * as http from "../http.js";
import type * as leads from "../leads.js";
import type * as orders from "../orders.js";
import type * as retention from "../retention.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  checkout: typeof checkout;
  crons: typeof crons;
  dispatcher: typeof dispatcher;
  http: typeof http;
  leads: typeof leads;
  orders: typeof orders;
  retention: typeof retention;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
