import { CMS_WRITE_ROLES, CognitoUserAttributes } from "../shared-types";

export const isCmsWriteUser = (user: CognitoUserAttributes) => {
  const userRoles = user["custom:cms-roles"];

  for (const role of CMS_WRITE_ROLES) {
    if (userRoles.includes(role)) {
      return true;
    }
  }
  return false;
};
