export enum UserRoles {
  CMS_READ_ONLY = "onemac-micro-readonly",
  CMS_REVIEWER = "onemac-micro-reviewer",
  HELPDESK = "onemac-micro-helpdesk",
  STATE_SUBMITTER = "onemac-micro-statesubmitter",
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
  UserRoles.HELPDESK,
];

export const CMS_WRITE_ROLES = [UserRoles.CMS_REVIEWER];

export const CMS_READ_ONLY_ROLES = [
  UserRoles.CMS_READ_ONLY,
  UserRoles.HELPDESK,
];

export const STATE_ROLES = [UserRoles.STATE_SUBMITTER];
