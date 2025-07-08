import { Request } from "@middy/core";
import { getInternal } from "@middy/util";
import { Context } from "aws-lambda";
import { FullUser } from "shared-types";
import { main } from "shared-types/opensearch";

export type ContextWithPackage = Context & { packageResult?: main.ItemResult };
export type ContextWithCurrUser = Context & { currUser?: FullUser };

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

/**
 * Stores the authenticated user in the request internal storage
 * @param {MiddyUser} currUser authenticated user to store in internal storage
 * @param {Request} request request to store the user in
 * @param {boolean} setToContext [false] if the user should also be stored in the request context so that it is available in the handler
 */
export const storeAuthUserInRequest = (
  currUser: FullUser,
  request: Request,
  setToContext?: boolean,
): void => {
  Object.assign(request.internal, { currUser });

  if (setToContext) {
    Object.assign(request.context, { currUser });
  }
};

/**
 * Gets the authenticated user from the request internal storage
 * @param {Request} request request the user is stored in
 * @returns {MiddyUser} the user or undefined if not found
 */
export const getAuthUserFromRequest = async (request: Request): Promise<FullUser | undefined> => {
  const { currUser } = (await getInternal("currUser", request)) as { currUser: FullUser };
  return currUser;
};
