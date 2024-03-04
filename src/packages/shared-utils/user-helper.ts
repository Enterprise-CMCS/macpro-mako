import {
  CMS_ROLES,
  CMS_WRITE_ROLES,
  CMS_READ_ONLY_ROLES,
  CognitoUserAttributes,
  STATE_ROLES,
  UserRoles,
  UserRolesString,
} from "shared-types";

const userHasAuthorizedRole = (
  user: CognitoUserAttributes | null,
  authorized: UserRoles[]
) => {
  if (!user) return false;
  const userRoles = user["custom:cms-roles"].split(",") as UserRoles[];
  return userRoles.filter((role) => authorized.includes(role)).length > 0;
};

export const isCmsUser = (user: CognitoUserAttributes) =>
  userHasAuthorizedRole(user, CMS_ROLES);

export const isCmsWriteUser = (user: CognitoUserAttributes) =>
  userHasAuthorizedRole(user, CMS_WRITE_ROLES);

export const isCmsReadonlyUser = (user: CognitoUserAttributes) =>
  userHasAuthorizedRole(user, CMS_READ_ONLY_ROLES);

export const isStateUser = (user: CognitoUserAttributes | null) =>
  userHasAuthorizedRole(user, STATE_ROLES);
