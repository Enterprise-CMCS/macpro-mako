import { TestUserDataWithRole } from "../../index.d";

export const makoReviewer: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: "mako.cmsuser@outlook.com",
    },
    {
      Name: "email_verified",
      Value: "true",
    },
    {
      Name: "given_name",
      Value: "CMSReviewer",
    },
    {
      Name: "family_name",
      Value: "Tester",
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
      Value: "53832e35-1fbe-4c74-9111-4a0cd29ce2cf",
    },
  ],
  Username: "53832e35-1fbe-4c74-9111-4a0cd29ce2cf",
  role: "cmsreviewer",
};

export const reviewer: TestUserDataWithRole = {
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
      Value: "CMS",
    },
    {
      Name: "family_name",
      Value: "Reviewer",
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
      Value: "07a2519e-0bdd-4bf6-8ec0-6f88ffa684fc",
    },
  ],
  Username: "07a2519e-0bdd-4bf6-8ec0-6f88ffa684fc",
  role: "cmsreviewer",
};

export const automatedReviewer: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: "automated-reviewer@example.com",
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
      Value: "Reviewer",
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
      Value: "e04f3cc5-4cd6-4acb-9fff-210b469bc934",
    },
  ],
  Username: "e04f3cc5-4cd6-4acb-9fff-210b469bc934",
  role: "cmsreviewer",
};

export const superReviewer: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: "super@example.com",
    },
    {
      Name: "email_verified",
      Value: "true",
    },
    {
      Name: "given_name",
      Value: "Superduper",
    },
    {
      Name: "family_name",
      Value: "Paratrooper",
    },
    {
      Name: "custom:state",
      Value: "",
    },
    {
      Name: "custom:cms-roles",
      Value: "onemac-micro-reviewer,onemac-micro-super",
    },
    {
      Name: "custom:ismemberof",
      Value: "ONEMAC_USER_D_SUPER",
    },
    {
      Name: "sub",
      Value: "1bddab21-ddc0-4e5b-8ee1-fe16a7883673",
    },
  ],
  Username: "1bddab21-ddc0-4e5b-8ee1-fe16a7883673",
  role: "cmsreviewer",
};

export const reviewers: TestUserDataWithRole[] = [
  makoReviewer,
  reviewer,
  automatedReviewer,
  superReviewer,
];
