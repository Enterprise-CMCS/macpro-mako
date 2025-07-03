import { MiddlewareObj, Request } from "@middy/core";
import { createError } from "@middy/util";
import { isCmsUser, isUserManagerUser } from "shared-utils";

import { getAuthUserFromRequest, getPackageFromRequest } from "./utils";

/**
 * Checks the user's permissions to determine if they can access the package.
 * @returns {MiddlewareObj} middleware the validate permission for a user to view a package before the handler runs
 */
export const canViewPackage = (): MiddlewareObj => ({
  before: async (request: Request) => {
    // Get the user to check if they are authorized to see the package
    const user = await getAuthUserFromRequest(request);
    const packageResult = await getPackageFromRequest(request);

    if (!user || !packageResult) {
      throw createError(500, JSON.stringify({ message: "Internal server error" }), {
        expose: true,
      });
    }

    if (
      !isCmsUser(user) &&
      (!user.states || !user.states.includes(packageResult?._source?.state.toUpperCase()))
    ) {
      throw createError(403, JSON.stringify({ message: "Not authorized to view this resource" }));
    }
  },
});

/**
 * Checks the user's permissions to determine if they can view the user.
 * @returns {MiddlewareObj} middleware the validate permission for a user to view a user before the handler runs
 */
export const canViewUser = (): MiddlewareObj => ({
  before: async (request: Request) => {
    // Get the user to check if they are authorized to see the user
    const currUser = await getAuthUserFromRequest(request);
    const { userEmail } = request.event.body;

    // if the user wasn't set in context throw an error
    if (!currUser || !currUser?.email) {
      console.error("User was not set to context and isn't available");
      throw createError(500, JSON.stringify({ message: "Internal server error" }), {
        expose: true,
      });
    }

    // if the userEmail was set but the authenticated user does not have
    // authorization to view another user's details, throw an error
    if (userEmail && currUser.email !== userEmail && !isUserManagerUser(currUser)) {
      throw createError(403, JSON.stringify({ message: "Not authorized to view this resource" }));
    }
  },
});
