export enum CmsRole {
  CMS_READ_ONLY = "cms-read-only",
  CMS_REVIEWER = "cms-reviewer",
  HELPDESK = "helpdesk",
  CMS_SYSTEM_ADMIN = "cms-system-admin",
  CMS_ROLE_APPROVER = "cms-role-approver",
  STATE_SUBMITTER = "state-submitter",
  STATE_SYSTEM_ADMIN = "state-system-admin",
}

export type CmsRolesString = `${CmsRole}${"," | ""}`;

export type CognitoUserAttributes = {
  sub: string;
  "custom:cms-roles": CmsRolesString; // comma-separated list of CmsRoles ex. "cms-reviewer,helpdesk" or "state-submitter"
  email_verified: boolean;
  "custom:state"?: string; // ex. "VA" or "VA,MD,CA" or undefined
  given_name: string;
  family_name: string;
  email: string;
};

export const CMS_ROLES = [
  CmsRole.CMS_READ_ONLY,
  CmsRole.CMS_REVIEWER,
  CmsRole.CMS_ROLE_APPROVER,
  CmsRole.CMS_SYSTEM_ADMIN,
  CmsRole.HELPDESK,
];
