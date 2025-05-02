import {
  CMS_READ_ONLY_ROLES,
  CMS_ROLES,
  CMS_WRITE_ROLES,
  CognitoUserAttributes,
  STATE_ROLES,
  UserRoles,
} from "shared-types";
import {
  ROLES_ALLOWED_TO_REQUEST,
  ROLES_ALLOWED_TO_UPDATE,
  roleUpdatePermissionsMap,
  UserRole,
} from "shared-types/events/legacy-user";

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
/** Confirms user is help desk user */
export const isHelpDeskUser = (user: CognitoUserAttributes | null) =>
  userHasAuthorizedRole(user, [UserRoles.HELPDESK]);
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

// Check if current user can update access for a certain role
export const canUpdateAccess = (currentUserRole: UserRole, roleToUpdate: UserRole): boolean => {
  if (ROLES_ALLOWED_TO_UPDATE.includes(currentUserRole)) {
    if (roleUpdatePermissionsMap[currentUserRole]?.includes(roleToUpdate)) {
      return true;
    }
  }
  return false;
};
// Check if current user can request to change their own role
export const canRequestAccess = (role: UserRole): boolean => {
  return ROLES_ALLOWED_TO_REQUEST.includes(role);
};
// Check if current user is a statesubmitter and is revoking their own state access
export const canSelfRevokeAccess = (
  currentRole: UserRole,
  currentEmail: string,
  emailToUpdate: string,
) => {
  return currentRole === "statesubmitter" && currentEmail === emailToUpdate;
};
