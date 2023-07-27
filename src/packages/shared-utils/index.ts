import { CMS_ROLES, CognitoUserAttributes } from '../shared-types'

export const isCmsUser = (user: CognitoUserAttributes) => {
  const userRoles = user["custom:cms-roles"];

  for (const cmsRole of CMS_ROLES) {
    if (userRoles.includes(cmsRole)) {
      return true;
    }
  }
  return false;
};
