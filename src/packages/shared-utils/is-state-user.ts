import { CognitoUserAttributes, STATE_ROLES } from "../shared-types";

export const isStateUser = (user: CognitoUserAttributes) => {
  const userRoles = user["custom:cms-roles"];

  for (const cmsRole of STATE_ROLES) {
    if (userRoles?.includes(cmsRole)) {
      return true;
    }
  }
  return false;
};
