import { Request } from "@middy/core";
import { createError, getInternal } from "@middy/util";
import { ItemResult } from "shared-types/opensearch/main";
import { isCmsUser } from "shared-utils";

import { MiddyUser } from "./isAuthenticated";

export const canViewPackage = () => ({
  before: async (request: Request) => {
    // Get the user to check if they are authorized to see the package
    const { user } = (await getInternal("user", request)) as { user: MiddyUser };
    const { packageResult } = (await getInternal("packageResult", request)) as {
      packageResult: ItemResult;
    };

    if (
      !isCmsUser(user.cognitoUser) &&
      (!user.cognitoUser.states || !user.cognitoUser.states.includes(packageResult._source.state))
    ) {
      throw createError(403, JSON.stringify({ message: "Not authorized to view this resource" }));
    }
  },
});
