import { MiddlewareObj, Request } from "@middy/core";
import { createError } from "@middy/util";
import { getAuthDetails, lookupUserAttributes } from "libs/api/auth/user";
import { FullUser } from "shared-types";
import { isCmsUser } from "shared-utils";

import {
  getActiveStatesForUserByEmail,
  getLatestActiveRoleByEmail,
} from "../user-management/userManagementService";
import { storeAuthUserInRequest } from "./utils";

export type IsAuthenticatedOptions = {
  setToContext?: boolean;
};

const defaults: IsAuthenticatedOptions = {
  setToContext: false,
};

/**
 * Authenticates the user and stores their data in internal storage.
 * @param {object} opts Options for running the middleware
 * @param {boolean} opts.setToContext [false] if true, also stores the package in context, so it can be accessed in the handler
 * @returns {MiddleObj} middleware to authenticate the user before the handler runs
 */
export const isAuthenticated = (opts: IsAuthenticatedOptions = {}): MiddlewareObj => {
  const options = { ...defaults, ...opts };

  return {
    before: async (request: Request) => {
      let authDetails;
      try {
        authDetails = getAuthDetails(request.event);
        if (!authDetails || !authDetails.userId || !authDetails.poolId) {
          throw new Error("No user or pool id");
        }
      } catch (err) {
        console.error(err);
        throw createError(401, JSON.stringify({ message: "User is not authenticated" }));
      }
      const { userId, poolId } = authDetails;

      let userAttributes;
      try {
        userAttributes = await lookupUserAttributes(userId, poolId);
      } catch (err) {
        console.error(err);
        throw createError(500, JSON.stringify({ message: "Internal server error" }), {
          expose: true,
        });
      }
      if (!userAttributes?.email) {
        // if you don't use the expose option here, you won't be able to see the error message
        throw createError(500, JSON.stringify({ message: "User is invalid" }), { expose: true });
      }
      const { email } = userAttributes;

      let latestActiveRole;
      try {
        latestActiveRole = await getLatestActiveRoleByEmail(email);
      } catch (err) {
        console.error(err);
        throw createError(500, JSON.stringify({ message: "Internal server error" }), {
          expose: true,
        });
      }

      const user: FullUser = {
        ...userAttributes,
        role: latestActiveRole?.role ?? "norole",
        states: [],
      };

      if (!isCmsUser(user)) {
        try {
          user.states = await getActiveStatesForUserByEmail(email, latestActiveRole?.role);
        } catch (err) {
          console.error(err);
          throw createError(500, JSON.stringify({ message: "Internal server error" }), {
            expose: true,
          });
        }
      }

      storeAuthUserInRequest(user, request, options.setToContext);
    },
  };
};
