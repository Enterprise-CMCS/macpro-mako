export const readOnlyUser = {
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
};

export const automatedReadOnlyUser = {
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
};

export const readOnlyUsers = [readOnlyUser, automatedReadOnlyUser];
