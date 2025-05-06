import { TestUserDataWithRole } from "../../index.d";

export const helpDeskUser: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: "helpdesk@example.com",
    },
    {
      Name: "email_verified",
      Value: "true",
    },
    {
      Name: "given_name",
      Value: "CMS",
    },
    {
      Name: "family_name",
      Value: "Helpdesk",
    },
    {
      Name: "custom:state",
      Value: "",
    },
    {
      Name: "custom:cms-roles",
      Value: "onemac-helpdesk",
    },
    {
      Name: "sub",
      Value: "7ebff3df-a133-4eb7-b62c-3346f2f81fd1",
    },
  ],
  Username: "7ebff3df-a133-4eb7-b62c-3346f2f81fd1",
  role: "helpdesk",
};

export const automatedHelpDeskUser: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: "automated-helpdesk@example.com",
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
      Value: "Helpdesk",
    },
    {
      Name: "custom:state",
      Value: "",
    },
    {
      Name: "custom:cms-roles",
      Value: "onemac-helpdesk",
    },
    {
      Name: "sub",
      Value: "63d9033c-5122-48eb-a664-74d391178938",
    },
  ],
  Username: "63d9033c-5122-48eb-a664-74d391178938",
  role: "helpdesk",
};

export const helpDeskUsers: TestUserDataWithRole[] = [helpDeskUser, automatedHelpDeskUser];
