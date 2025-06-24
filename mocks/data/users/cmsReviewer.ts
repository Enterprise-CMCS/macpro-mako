import { TestUserDataWithRole } from "../../index.d";

export const AUTOMATED_REVIEWER_EMAIL = "automated-reviewer@example.com";
export const AUTOMATED_REVIEWER_USERNAME = "e04f3cc5-4cd6-4acb-9fff-210b469bc934";
export const MAKO_REVIEWER_EMAIL = "mako.cmsuser@outlook.com";
export const MAKO_REVIEWER_USERNAME = "53832e35-1fbe-4c74-9111-4a0cd29ce2cf";
export const REVIEWER_EMAIL = "reviewer@example.com";
export const REVIEWER_USERNAME = "07a2519e-0bdd-4bf6-8ec0-6f88ffa684fc";
export const SUPER_REVIEWER_EMAIL = "super@example.com";
export const SUPER_REVIEWER_USERNAME = "1bddab21-ddc0-4e5b-8ee1-fe16a7883673";

export const automatedReviewer: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: AUTOMATED_REVIEWER_EMAIL,
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
      Value: AUTOMATED_REVIEWER_USERNAME,
    },
  ],
  Username: AUTOMATED_REVIEWER_USERNAME,
  role: "cmsreviewer",
  states: [],
};

export const makoReviewer: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: MAKO_REVIEWER_EMAIL,
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
      Value: MAKO_REVIEWER_USERNAME,
    },
  ],
  Username: MAKO_REVIEWER_USERNAME,
  role: "cmsreviewer",
  states: [],
};

export const reviewer: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: REVIEWER_EMAIL,
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
      Value: REVIEWER_USERNAME,
    },
  ],
  Username: REVIEWER_USERNAME,
  role: "cmsreviewer",
  states: [],
};

export const superReviewer: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: SUPER_REVIEWER_EMAIL,
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
      Value: SUPER_REVIEWER_USERNAME,
    },
  ],
  Username: SUPER_REVIEWER_USERNAME,
  role: "cmsreviewer",
  states: [],
};

export const reviewerUsernamesByEmail = {
  [AUTOMATED_REVIEWER_EMAIL]: AUTOMATED_REVIEWER_USERNAME,
  [MAKO_REVIEWER_EMAIL]: MAKO_REVIEWER_USERNAME,
  [REVIEWER_EMAIL]: REVIEWER_USERNAME,
  [SUPER_REVIEWER_EMAIL]: SUPER_REVIEWER_USERNAME,
};

export const reviewers: TestUserDataWithRole[] = [
  automatedReviewer,
  makoReviewer,
  reviewer,
  superReviewer,
];
