import { Request } from "@middy/core";
import { createError } from "@middy/util";
import { isCmsUser } from "shared-utils";

import { getPackage, getUser } from "./utils";

export const canViewPackage = () => ({
  before: async (request: Request) => {
    // Get the user to check if they are authorized to see the package
    const user = await getUser(request);
    const packageResult = await getPackage(request);

    if (!user?.cognitoUser || !packageResult) {
      throw createError(500, JSON.stringify({ message: "Internal server error" }), {
        expose: true,
      });
    }

    if (
      !isCmsUser(user.cognitoUser) &&
      (!user.cognitoUser.states || !user.cognitoUser.states.includes(packageResult?._source?.state))
    ) {
      throw createError(403, JSON.stringify({ message: "Not authorized to view this resource" }));
    }
  },
});
