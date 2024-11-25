export const helpDeskUser = {
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
      Value: "onemac-micro-helpdesk",
    },
    {
      Name: "sub",
      Value: "7ebff3df-a133-4eb7-b62c-3346f2f81fd1",
    },
  ],
  Username: "7ebff3df-a133-4eb7-b62c-3346f2f81fd1",
};

export const automatedHelpDeskUser = {
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
      Value: "onemac-micro-helpdesk",
    },
    {
      Name: "sub",
      Value: "63d9033c-5122-48eb-a664-74d391178938",
    },
  ],
  Username: "63d9033c-5122-48eb-a664-74d391178938",
};

export const helpDeskUsers = [helpDeskUser, automatedHelpDeskUser];
