export enum UserRoles {
  CMS_READ_ONLY = "onemac-micro-readonly",
  CMS_REVIEWER = "onemac-micro-reviewer",
  HELPDESK = "onemac-micro-helpdesk",
  CMS_SYSTEM_ADMIN = "onemac-micro-sysadmin",
  CMS_ROLE_APPROVER = "onemac-micro-roleapprover",
  STATE_SUBMITTER = "onemac-micro-statesubmitter",
  STATE_SYSTEM_ADMIN = "onemac-micro-statesysadmin",
}

export type UserRolesString = `${UserRoles}${"," | ""}` | "";

export type CognitoUserAttributes = {
  sub: string;
  "custom:cms-roles": UserRolesString; // comma-separated list of UserRoles ex. "onemac-micro-reviewer,onemac-micro-helpdesk" or "onemac-micro-statesubmitter"
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
