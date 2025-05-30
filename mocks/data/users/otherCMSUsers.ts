import { TestUserDataWithRole } from "../../index.d";

export const systemAdmin: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: "systemadmin@example.com",
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
      Value: "bd3fb35d-6495-4665-8bab-d00693796e91",
    },
  ],
  Username: "bd3fb35d-6495-4665-8bab-d00693796e91",
  role: "systemadmin",
  states: [],
};

export const cmsRoleApprover: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: "cmsroleapprover@example.com",
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
      Value: "dc891f53-d20c-484a-bc40-447fce719658",
    },
  ],
  Username: "dc891f53-d20c-484a-bc40-447fce719658",
  role: "cmsroleapprover",
  states: [],
};

export const defaultCMSUser: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: "defaultcmsuser@example.com",
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
      Value: "cd613967-c034-4e02-baad-03221840a35d",
    },
  ],
  Username: "cd613967-c034-4e02-baad-03221840a35d",
  role: "defaultcmsuser",
  states: [],
};

export const cmsUsers: TestUserDataWithRole[] = [systemAdmin, cmsRoleApprover, defaultCMSUser];
