import { TestUserDataWithRole } from "../../index.d";

export const AUTOMATED_HELP_DESK_USER_EMAIL = "automated-helpdesk@example.com";
export const AUTOMATED_HELP_DESK_USER_USERNAME = "63d9033c-5122-48eb-a664-74d391178938";
export const HELP_DESK_USER_EMAIL = "helpdesk@example.com";
export const HELP_DESK_USER_USERNAME = "7ebff3df-a133-4eb7-b62c-3346f2f81fd1";

export const automatedHelpDeskUser: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: AUTOMATED_HELP_DESK_USER_EMAIL,
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
      Value: AUTOMATED_HELP_DESK_USER_USERNAME,
    },
  ],
  Username: AUTOMATED_HELP_DESK_USER_USERNAME,
  role: "helpdesk",
  states: [],
};

export const helpDeskUser: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: HELP_DESK_USER_EMAIL,
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
      Value: HELP_DESK_USER_USERNAME,
    },
  ],
  Username: HELP_DESK_USER_USERNAME,
  role: "helpdesk",
  states: [],
};

export const helpDeskUserUsernamesByEmail = {
  [AUTOMATED_HELP_DESK_USER_EMAIL]: AUTOMATED_HELP_DESK_USER_USERNAME,
  [HELP_DESK_USER_EMAIL]: HELP_DESK_USER_USERNAME,
};

export const helpDeskUsers: TestUserDataWithRole[] = [automatedHelpDeskUser, helpDeskUser];
