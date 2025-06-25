import { TestUserDataWithRole } from "../../index.d";

export const CMS_ROLE_APPROVER_EMAIL = "cmsroleapprover@example.com";
export const CMS_ROLE_APPROVER_USERNAME = "dc891f53-d20c-484a-bc40-447fce719658";
export const DEFAULT_CMS_USER_EMAIL = "defaultcmsuser@example.com";
export const DEFAULT_CMS_USER_USERNAME = "cd613967-c034-4e02-baad-03221840a35d";
export const SYSTEM_ADMIN_EMAIL = "systemadmin@example.com";
export const SYSTEM_ADMIN_USERNAME = "bd3fb35d-6495-4665-8bab-d00693796e91";

export const cmsRoleApprover: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: CMS_ROLE_APPROVER_EMAIL,
    },
    {
      Name: "email_verified",
      Value: "true",
    },
    {
      Name: "given_name",
      Value: "CMSRole",
    },
    {
      Name: "family_name",
      Value: "Approver",
    },
    {
      Name: "custom:state",
      Value: "",
    },
    {
      Name: "custom:ismemberof",
      Value: "ONEMAC_USER_D",
    },
    {
      Name: "sub",
      Value: CMS_ROLE_APPROVER_USERNAME,
    },
  ],
  Username: CMS_ROLE_APPROVER_USERNAME,
  role: "cmsroleapprover",
  states: [],
};

export const defaultCMSUser: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: DEFAULT_CMS_USER_EMAIL,
    },
    {
      Name: "email_verified",
      Value: "true",
    },
    {
      Name: "given_name",
      Value: "DefaultCMS",
    },
    {
      Name: "family_name",
      Value: "User",
    },
    {
      Name: "custom:state",
      Value: "",
    },
    {
      Name: "custom:cms-roles",
      Value: "onemac-micro-readonly",
    },
    {
      Name: "sub",
      Value: DEFAULT_CMS_USER_USERNAME,
    },
  ],
  Username: DEFAULT_CMS_USER_USERNAME,
  role: "defaultcmsuser",
  states: [],
};

export const systemAdmin: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: SYSTEM_ADMIN_EMAIL,
    },
    {
      Name: "email_verified",
      Value: "true",
    },
    {
      Name: "given_name",
      Value: "System",
    },
    {
      Name: "family_name",
      Value: "Admin",
    },
    {
      Name: "custom:state",
      Value: "",
    },
    {
      Name: "custom:ismemberof",
      Value: "ONEMAC_USER_D",
    },
    {
      Name: "sub",
      Value: SYSTEM_ADMIN_USERNAME,
    },
  ],
  Username: SYSTEM_ADMIN_USERNAME,
  role: "systemadmin",
  states: [],
};

export const cmsUserUsernamesByEmail = {
  [CMS_ROLE_APPROVER_EMAIL]: CMS_ROLE_APPROVER_USERNAME,
  [DEFAULT_CMS_USER_EMAIL]: DEFAULT_CMS_USER_USERNAME,
  [SYSTEM_ADMIN_EMAIL]: SYSTEM_ADMIN_USERNAME,
};

export const cmsUsers: TestUserDataWithRole[] = [cmsRoleApprover, defaultCMSUser, systemAdmin];
