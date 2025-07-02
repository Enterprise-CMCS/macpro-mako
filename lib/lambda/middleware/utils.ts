import { Request } from "@middy/core";
import { getInternal } from "@middy/util";
import { FullUser } from "shared-types";
import { main, roles, users } from "shared-types/opensearch";

/**
 * Stores the package in the request internal storage
 * @param {main.ItemResult} packageResult package to store
 * @param {Request} request request to store the package in
 * @param {boolean} setToContext [false] if the package should also be stored in the request context so that it is available in the handler
 */
export const storePackageInRequest = (
  packageResult: main.ItemResult | undefined,
  request: Request,
  setToContext?: boolean,
): void => {
  Object.assign(request.internal, { packageResult });

  if (setToContext) {
    Object.assign(request.context, { packageResult });
  }
};

/**
 * Gets the package from the request internal storage
 * @param {Request} request request the package is stored in
 * @returns {main.ItemResult} the package or undefined if not found
 */
export const getPackageFromRequest = async (
  request: Request,
): Promise<main.ItemResult | undefined> => {
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

/**
 * Stores the user in the request internal storage
 * @param {MiddyUser} user user to store in internal storage
 * @param {Request} request request to store the user in
 * @param {boolean} setToContext [false] if the user should also be stored in the request context so that it is available in the handler
 */
export const storeUserInRequest = (
  user: MiddyUser,
  request: Request,
  setToContext?: boolean,
): void => {
  Object.assign(request.internal, { user });

  if (setToContext) {
    Object.assign(request.context, { user });
  }
};

/**
 * Gets the user from the request internal storage
 * @param {Request} request request the user is stored in
 * @returns {MiddyUser} the user or undefined if not found
 */
export const getUserFromRequest = async (request: Request): Promise<MiddyUser | undefined> => {
  const { user } = (await getInternal("user", request)) as { user: MiddyUser };
  return user;
};
