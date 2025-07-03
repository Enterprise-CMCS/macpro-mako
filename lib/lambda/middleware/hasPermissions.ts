import { MiddlewareObj, Request } from "@middy/core";
import { createError } from "@middy/util";
import { isCmsUser } from "shared-utils";

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
