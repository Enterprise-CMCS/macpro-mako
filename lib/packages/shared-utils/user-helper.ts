import {
  CMS_READ_ONLY_ROLES,
  CMS_ROLES,
  CMS_WRITE_ROLES,
  CognitoUserAttributes,
  STATE_ROLES,
  UserRoles,
} from "shared-types";

/** Function receives a user's cognito attributes and list of authorized roles,
 * and will confirm the user has one or more authorized UserRoles */
const userHasAuthorizedRole = (user: CognitoUserAttributes | null, authorized: UserRoles[]) => {
  if (!user) return false;
  const euaRoles = user["custom:ismemberof"] as UserRoles;
  const idmRoles = (user?.["custom:cms-roles"]?.split(",") ?? []) as UserRoles[];
  const userRoles = [euaRoles, ...idmRoles];

  return userRoles.filter((role) => authorized.includes(role)).length > 0;
};

/** Confirms user is any kind of CMS user */
export const isCmsUser = (user: CognitoUserAttributes | null) =>
  userHasAuthorizedRole(user, CMS_ROLES);
/** Confirms user is a CMS user who can create data */
export const isCmsWriteUser = (user: CognitoUserAttributes | null) =>
  userHasAuthorizedRole(user, CMS_WRITE_ROLES);
/** Confirms user is a CMS user who can only view data */
export const isCmsReadonlyUser = (user: CognitoUserAttributes | null) =>
  userHasAuthorizedRole(user, CMS_READ_ONLY_ROLES);
/** Confirms user is a State user */
export const isStateUser = (user: CognitoUserAttributes | null) =>
  userHasAuthorizedRole(user, STATE_ROLES);
/** Confirms user is a State user */
export const isCmsSuperUser = (user: CognitoUserAttributes | null) =>
  userHasAuthorizedRole(user, [UserRoles.CMS_SUPER_USER]);
/** Confirms user is an IDM user */
export const isIDM = (user: CognitoUserAttributes | null) => user?.username.startsWith("IDM_");
