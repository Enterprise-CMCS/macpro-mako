export enum UserRoles {
  CMS_READ_ONLY = "cms-read-only",
  CMS_REVIEWER = "cms-reviewer",
  HELPDESK = "helpdesk",
  CMS_SYSTEM_ADMIN = "cms-system-admin",
  CMS_ROLE_APPROVER = "cms-role-approver",
  STATE_SUBMITTER = "state-submitter",
  STATE_SYSTEM_ADMIN = "state-system-admin",
}

export type UserRolesString = `${UserRoles}${"," | ""}` | "";

export type CognitoUserAttributes = {
  sub: string;
  "custom:cms-roles": UserRolesString; // comma-separated list of UserRoles ex. "cms-reviewer,helpdesk" or "state-submitter"
  email_verified: boolean;
  "custom:state"?: string; // ex. "VA" or "VA,MD,CA" or undefined
  given_name: string;
  family_name: string;
  email: string;
};

export const CMS_ROLES = [
  UserRoles.CMS_READ_ONLY,
  UserRoles.CMS_REVIEWER,
  UserRoles.CMS_ROLE_APPROVER,
  UserRoles.CMS_SYSTEM_ADMIN,
  UserRoles.HELPDESK,
];
