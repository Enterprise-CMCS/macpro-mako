import {
  CMS_READ_ONLY_ROLES,
  CMS_ROLES,
  CMS_WRITE_ROLES,
  FullUser,
  STATE_ROLES,
} from "shared-types";
import { UserRole } from "shared-types/events/legacy-user";

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
