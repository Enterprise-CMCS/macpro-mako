import { TestUserDataWithRole } from "../../index.d";

export const readOnlyUser: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: "readonly@example.com",
    },
    {
      Name: "email_verified",
      Value: "true",
    },
    {
      Name: "given_name",
      Value: "Read",
    },
    {
      Name: "family_name",
      Value: "Only",
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
      Value: "cd613967-c034-4e02-baad-03221840a35c",
    },
  ],
  Username: "cd613967-c034-4e02-baad-03221840a35c",
  role: "helpdesk",
};

export const automatedReadOnlyUser: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: "automated-readonly@example.com",
    },
    {
      Name: "email_verified",
      Value: "true",
    },
    {
      Name: "given_name",
      Value: "Otto",
    },
    {
      Name: "family_name",
      Value: "Readonly",
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
      Value: "acfaf0ae-1af5-4e48-ad1e-54abcee4f3bf",
    },
  ],
  Username: "acfaf0ae-1af5-4e48-ad1e-54abcee4f3bf",
  role: "helpdesk",
};

export const defaultCMSUser: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: "reviewer@example.com",
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
};

export const readOnlyUsers: TestUserDataWithRole[] = [readOnlyUser, automatedReadOnlyUser];
