import { TestUserData } from "../../index.d";

export const systemAdmin: TestUserData = {
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
};

export const cmsRoleApprover: TestUserData = {
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
};

export const cmsUsers: TestUserData[] = [systemAdmin, cmsRoleApprover];
