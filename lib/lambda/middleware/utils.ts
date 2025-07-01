import { Request } from "@middy/core";
import { getInternal } from "@middy/util";
import { FullUser } from "shared-types";
import { main, roles, users } from "shared-types/opensearch";

export const setPackage = (
  packageResult: main.ItemResult | undefined,
  request: Request,
  setToContext?: boolean,
): void => {
  Object.assign(request.internal, { packageResult });

  if (setToContext) {
    Object.assign(request.context, { packageResult });
  }
};

export const getPackage = async (request: Request): Promise<main.ItemResult | undefined> => {
  const { packageResult } = (await getInternal("packageResult", request)) as {
    packageResult: main.ItemResult;
  };
  return packageResult;
};

export type MiddyUser = {
  cognitoUser: FullUser;
  userDetails: users.Document | null;
  userProfile: roles.Document[];
};

export const setUser = (user: MiddyUser, request: Request, setToContext?: boolean): void => {
  Object.assign(request.internal, { user });

  if (setToContext) {
    Object.assign(request.context, { user });
  }
};

export const getUser = async (request: Request): Promise<MiddyUser | undefined> => {
  const { user } = (await getInternal("user", request)) as { user: MiddyUser };
  return user;
};
