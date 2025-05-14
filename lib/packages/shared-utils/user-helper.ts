import {
  CMS_READ_ONLY_ROLES,
  CMS_ROLES,
  CMS_WRITE_ROLES,
  FullUser,
  STATE_ROLES,
} from "shared-types";
import {
  ROLES_ALLOWED_TO_REQUEST,
  ROLES_ALLOWED_TO_UPDATE,
  roleUpdatePermissionsMap,
  UserRole,
} from "shared-types/events/legacy-user";

/** Function receives a user's cognito attributes and list of authorized roles,
 * and will confirm the user has one or more authorized UserRoles */
const userHasAuthorizedRole = (user: FullUser | null, authorized: UserRole[]) => {
  if (!user) return false;

  return authorized.includes(user.role);
};

/** Confirms user is any kind of CMS user */
export const isCmsUser = (user: FullUser | null) => userHasAuthorizedRole(user, CMS_ROLES);
/** Confirms user is help desk user */
export const isHelpDeskUser = (user: FullUser | null) => userHasAuthorizedRole(user, ["helpdesk"]);
/** Confirms user is a CMS user who can create data */
export const isCmsWriteUser = (user: FullUser | null) =>
  userHasAuthorizedRole(user, CMS_WRITE_ROLES);
/** Confirms user is a CMS user who can only view data */
export const isCmsReadonlyUser = (user: FullUser | null) =>
  userHasAuthorizedRole(user, CMS_READ_ONLY_ROLES);
/** Confirms user is a State user */
export const isStateUser = (user: FullUser | null) => userHasAuthorizedRole(user, STATE_ROLES);
/** Confirms user is a State user */
export const isCmsSuperUser = (user: FullUser | null) => userHasAuthorizedRole(user, []);
/** Confirms user is an IDM user */
export const isIDM = (user: FullUser | null) => user?.username.startsWith("IDM_");

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
