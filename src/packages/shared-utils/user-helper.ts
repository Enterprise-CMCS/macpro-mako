import {
  CMS_ROLES,
  CMS_WRITE_ROLES,
  CMS_READ_ONLY_ROLES,
  CognitoUserAttributes,
  STATE_ROLES,
  UserRoles,
} from "shared-types";
import { z } from "zod";

/** Function receives a user's cognito attributes and list of authorized roles,
 * and will confirm the user has one or more authorized UserRoles */
const userHasAuthorizedRole = (
  user: CognitoUserAttributes | null,
  authorized: UserRoles[],
) => {
  if (!user) return false;
  const userRoles = user["custom:cms-roles"].split(",") as UserRoles[];
  return userRoles.filter((role) => authorized.includes(role)).length > 0;
};

/** Confirms user is any kind of CMS user */
export const isCmsUser = (user: CognitoUserAttributes) =>
  userHasAuthorizedRole(user, CMS_ROLES);
/** Confirms user is a CMS user who can create data */
export const isCmsWriteUser = (user: CognitoUserAttributes) =>
  userHasAuthorizedRole(user, CMS_WRITE_ROLES);
/** Confirms user is a CMS user who can only view data */
export const isCmsReadonlyUser = (user: CognitoUserAttributes) =>
  userHasAuthorizedRole(user, CMS_READ_ONLY_ROLES);
/** Confirms user is a State user */
export const isStateUser = (user: CognitoUserAttributes | null) =>
  userHasAuthorizedRole(user, STATE_ROLES);
/** Confirms user is an IDM user */
export const isIDM = (user: CognitoUserAttributes | null) =>
  user?.username.startsWith("IDM_");
