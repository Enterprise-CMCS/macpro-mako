import { MiddlewareObj, Request } from "@middy/core";
import { createError } from "@middy/util";
import { getAuthDetails, lookupUserAttributes } from "libs/api/auth/user";
import { FullUser } from "shared-types";
import { roles, users } from "shared-types/opensearch";
import { isCmsUser } from "shared-utils";

import {
  getAllUserRolesByEmail,
  getLatestActiveRoleByEmail,
  getUserByEmail,
} from "../user-management/userManagementService";
import { storeUserInRequest } from "./utils";

export type IsAuthenticatedOptions = {
  setToContext?: boolean;
  withDetails?: boolean;
  withRoles?: boolean;
};

const defaults: IsAuthenticatedOptions = {
  setToContext: false,
  withDetails: true,
  withRoles: true,
};

/**
 * Authenticates the user and sets their details and roles in internal storage.
 * @param {object} opts Options for running the middleware
 * @param {boolean} opts.setToContext [false] if true, also stores the package in context, so it can be accessed in the handler
 * @param {boolean} opts.withDetails [true] if false, skip fetching the user's details
 * @param {boolean} opts.withRoles [true] if false, skip fetching the user's role and active states
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
      const userAttributes = await lookupUserAttributes(userId, poolId);
      if (!userAttributes?.email) {
        // if you don't use the expose option here, you won't be able to see the error message
        throw createError(500, JSON.stringify({ message: "User is not valid" }), { expose: true });
      }
      const { email } = userAttributes;

      const latestActiveRole = await getLatestActiveRoleByEmail(email);

      const cognitoUser: FullUser = {
        ...userAttributes,
        role: latestActiveRole?.role ?? "norole",
        states: [],
      };

      let userDetails: users.Document | null = null;
      if (options.withDetails) {
        userDetails = await getUserByEmail(email);
      }

      let userProfile: roles.Document[] = [];
      if (options.withRoles) {
        userProfile = await getAllUserRolesByEmail(email);
        const activeRoles = userProfile.filter((role) => role.status === "active");

        if (!isCmsUser(cognitoUser)) {
          cognitoUser.states = Array.from(
            new Set(activeRoles.map((role) => role.territory.toUpperCase())),
          );
        }
      }

      storeUserInRequest(
        {
          cognitoUser,
          userDetails,
          userProfile,
        },
        request,
        options.setToContext,
      );
    },
  };
};
