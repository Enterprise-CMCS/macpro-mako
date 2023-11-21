import { CMS_ROLES, CMS_WRITE_ROLES, CMS_READ_ONLY_ROLES, CognitoUserAttributes, STATE_ROLES } from "../shared-types";

export const isCmsUser = (user: CognitoUserAttributes) => {
  const userRoles = user["custom:cms-roles"];

  for (const cmsRole of CMS_ROLES) {
    if (userRoles.includes(cmsRole)) {
      return true;
    }
  }
  return false;
};

export const isCmsWriteUser = (user: CognitoUserAttributes) => {
  const userRoles = user["custom:cms-roles"];

  for (const role of CMS_WRITE_ROLES) {
    if (userRoles.includes(role)) {
      return true;
    }
  }
  return false;
};

export const isCmsReadonlyUser = (user: CognitoUserAttributes) => {
  const userRoles = user["custom:cms-roles"];

  for (const role of CMS_READ_ONLY_ROLES) {
    if (userRoles.includes(role)) {
      return true;
    }
  }
  return false;
}

export const isStateUser = (user: CognitoUserAttributes) => {
  const userRoles = user["custom:cms-roles"];

  for (const role of STATE_ROLES) {
    if (userRoles.includes(role)) {
      return true;
    }
  }
  return false;

}
