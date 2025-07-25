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
      throw new Error("User or package were not stored on the request");
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
    const authenticatedUser = await getAuthUserFromRequest(request);
    const { userEmail } = request.event.body;

    // if the user wasn't set in context throw an error
    if (!authenticatedUser || !authenticatedUser?.email) {
      throw new Error("User was not stored on the request");
    }

    // if the userEmail was set but the authenticated user does not have
    // authorization to view another user's details, throw an error
    if (
      userEmail &&
      authenticatedUser.email !== userEmail &&
      !isUserManagerUser(authenticatedUser)
    ) {
      throw createError(403, JSON.stringify({ message: "Not authorized to view this resource" }));
    }
  },
});
