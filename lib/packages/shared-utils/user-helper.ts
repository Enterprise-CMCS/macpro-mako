import {
  CMS_READ_ONLY_ROLES,
  CMS_ROLES,
  CMS_WRITE_ROLES,
  FullUser,
  STATE_ROLES,
  USER_MANAGER_ROLES,
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
/** Confirms user can manage other users */
export const isUserManagerUser = (user: FullUser | null) =>
  userHasAuthorizedRole(user, USER_MANAGER_ROLES);
/** Confirms user is a State user */
export const isStateUser = (user: FullUser | null) => userHasAuthorizedRole(user, STATE_ROLES);
/** Confirms user is a State user */
// export const isCmsSuperUser = (user: FullUser | null) => userHasAuthorizedRole(user, []);
/** Confirms user is an IDM user */
export const isIDM = (user: FullUser | null) => user?.username.startsWith("IDM_");

/** Checks if role is a state role */
export const isStateRole = (role: UserRole): boolean => {
  return STATE_ROLES.includes(role as (typeof STATE_ROLES)[number]);
};

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

// gets the role that approves current user
export function getApprovingRole(role: string) {
  const approvingUserRole = {
    statesubmitter: "statesystemadmin",
    statesystemadmin: "cmsroleapprover",
    cmsroleapprover: "systemadmin",
    defaultcmsuser: "cmsroleapprover",
    helpdesk: "systemadmin",
    cmsreviewer: "cmsroleapprover",
    norole: "systemadmin",
  };

  return approvingUserRole[role as keyof typeof approvingUserRole] ?? role;
}

export const userRoleMap = {
  defaultcmsuser: "CMS Read-only User",
  cmsroleapprover: "CMS Role Approver",
  cmsreviewer: "CMS Read-only User",
  statesystemadmin: "State System Admin",
  helpdesk: "Help Desk",
  statesubmitter: "State Submitter",
  systemadmin: "CMS System Admin",
  norole: "No Role",
};

export const newUserRoleMap = {
  defaultcmsuser: "CMS Read Only",
  cmsroleapprover: "CMS Role Approver",
  cmsreviewer: "CMS Read Only",
  statesystemadmin: "State System Admin",
  helpdesk: "Help Desk",
  statesubmitter: "State Submitter",
  systemadmin: "CMS System Admin",
  norole: "No Role",
};
