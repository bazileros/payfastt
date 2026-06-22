/* eslint-disable */
/**
 * Generated `ComponentApi` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type { FunctionReference } from "convex/server";

/**
 * A utility for referencing a Convex component's exposed API.
 *
 * Useful when expecting a parameter like `components.myComponent`.
 * Usage:
 * ```ts
 * async function myFunction(ctx: QueryCtx, component: ComponentApi) {
 *   return ctx.runQuery(component.someFile.someQuery, { ...args });
 * }
 * ```
 */
export type ComponentApi<Name extends string | undefined = string | undefined> =
  {
    functions: {
      lib: {
        cancelSubscription: FunctionReference<
          "action",
          "internal",
          { token: string; userId?: string },
          { success: boolean },
          Name
        >;
        chargeSubscriptionAdhoc: FunctionReference<
          "action",
          "internal",
          {
            amount: number;
            itemDescription?: string;
            itemName?: string;
            itn?: boolean;
            mPaymentId?: string;
            token: string;
            userId?: string;
          },
          { response: string; success: boolean },
          Name
        >;
        generateCheckoutForm: FunctionReference<
          "mutation",
          "internal",
          {
            amount: number;
            billingDate?: string;
            cancelUrl?: string;
            confirmationAddress?: string;
            customInt1?: number;
            customInt2?: number;
            customInt3?: number;
            customInt4?: number;
            customInt5?: number;
            customStr1?: string;
            customStr2?: string;
            customStr3?: string;
            customStr4?: string;
            customStr5?: string;
            cycles?: number;
            emailConfirmation?: boolean;
            frequency?: number;
            itemDescription?: string;
            itemName: string;
            mPaymentId?: string;
            notifyUrl?: string;
            paymentMethod?: string;
            recurringAmount?: number;
            returnUrl?: string;
            setup?: string;
            subscriptionType?: number;
            token?: string;
            userId?: string;
          },
          {
            actionUrl: string;
            fields: Record<string, string>;
            signature: string;
            transactionId: string;
          },
          Name
        >;
        generateOnsitePaymentIdentifier: FunctionReference<
          "action",
          "internal",
          {
            amount: number;
            cancelUrl?: string;
            confirmationAddress?: string;
            customInt1?: number;
            customInt2?: number;
            customInt3?: number;
            customInt4?: number;
            customInt5?: number;
            customStr1?: string;
            customStr2?: string;
            customStr3?: string;
            customStr4?: string;
            customStr5?: string;
            emailConfirmation?: boolean;
            itemDescription?: string;
            itemName: string;
            mPaymentId?: string;
            notifyUrl?: string;
            paymentMethod?: string;
            returnUrl?: string;
            setup?: string;
            userId?: string;
          },
          any,
          Name
        >;
        getSubscription: FunctionReference<
          "query",
          "internal",
          { token: string },
          null | {
            _creationTime: number;
            _id: string;
            amount?: number;
            cycles?: number;
            cyclesComplete?: number;
            itemName: string;
            nextRunDate?: string;
            runDate?: string;
            status: string;
            token: string;
            userId?: string;
          },
          Name
        >;
        getTransaction: FunctionReference<
          "query",
          "internal",
          { transactionId: string },
          null | {
            _creationTime: number;
            _id: string;
            amount: number;
            billingDate?: string;
            confirmationAddress?: string;
            currency?: string;
            customInt1?: number;
            customInt2?: number;
            customInt3?: number;
            customInt4?: number;
            customInt5?: number;
            customStr1?: string;
            customStr2?: string;
            customStr3?: string;
            customStr4?: string;
            customStr5?: string;
            emailConfirmation?: boolean;
            itemDescription?: string;
            itemName: string;
            mPaymentId?: string;
            pfPaymentId?: number;
            pfToken?: string;
            signature: string;
            status: string;
            token?: string;
            userId?: string;
          },
          Name
        >;
        getUserProfile: FunctionReference<
          "query",
          "internal",
          { userId: string },
          null | {
            _creationTime: number;
            _id: string;
            email?: string;
            metadata?: any;
            name?: string;
            userId: string;
          },
          Name
        >;
        listSubscriptions: FunctionReference<
          "query",
          "internal",
          { limit?: number; status?: string; userId?: string },
          Array<{
            _creationTime: number;
            _id: string;
            amount?: number;
            cycles?: number;
            cyclesComplete?: number;
            itemName: string;
            nextRunDate?: string;
            runDate?: string;
            status: string;
            token: string;
            userId?: string;
          }>,
          Name
        >;
        listTransactions: FunctionReference<
          "query",
          "internal",
          { limit?: number; status?: string; userId?: string },
          Array<{
            _creationTime: number;
            _id: string;
            amount: number;
            billingDate?: string;
            confirmationAddress?: string;
            currency?: string;
            customInt1?: number;
            customInt2?: number;
            customInt3?: number;
            customInt4?: number;
            customInt5?: number;
            customStr1?: string;
            customStr2?: string;
            customStr3?: string;
            customStr4?: string;
            customStr5?: string;
            emailConfirmation?: boolean;
            itemDescription?: string;
            itemName: string;
            mPaymentId?: string;
            pfPaymentId?: number;
            pfToken?: string;
            signature: string;
            status: string;
            token?: string;
            userId?: string;
          }>,
          Name
        >;
        pauseSubscription: FunctionReference<
          "action",
          "internal",
          { token: string; userId?: string },
          { success: boolean },
          Name
        >;
        processITN: FunctionReference<
          "mutation",
          "internal",
          { pfData: any },
          { status: string },
          Name
        >;
        queryCreditCards: FunctionReference<
          "action",
          "internal",
          {},
          any,
          Name
        >;
        queryTransactions: FunctionReference<
          "action",
          "internal",
          { offset?: number },
          any,
          Name
        >;
        refundTransaction: FunctionReference<
          "action",
          "internal",
          { amount?: number; ptxId: string; userId?: string },
          { response: string; success: boolean },
          Name
        >;
        saveUserProfile: FunctionReference<
          "mutation",
          "internal",
          { email?: string; metadata?: any; name?: string; userId: string },
          string,
          Name
        >;
        unpauseSubscription: FunctionReference<
          "action",
          "internal",
          { token: string; userId?: string },
          { success: boolean },
          Name
        >;
        updateSubscription: FunctionReference<
          "action",
          "internal",
          {
            amount?: number;
            cycles?: number;
            frequency?: number;
            runDate?: string;
            token: string;
            userId?: string;
          },
          { success: boolean },
          Name
        >;
      };
    };
  };
