import type { TestUserData } from "../../index.d";
import { reviewers, makoReviewer, superReviewer } from "./cmsReviewer";
import { helpDeskUsers, helpDeskUser } from "./helpDeskUsers";
import { readOnlyUsers, readOnlyUser } from "./readOnlyCMSUsers";
import { stateSubmitters, makoStateSubmitter, coStateSubmitter } from "./stateSubmitters";
import { convertUserAttributes } from "../../handlers/authUtils";

export const noRoleUser: TestUserData = {
  UserAttributes: [
    {
      Name: "email",
      Value: "badfootball@example.com",
    },
    {
      Name: "given_name",
      Value: "bad",
    },
    {
      Name: "family_name",
      Value: "football",
    },
    {
      Name: "email_verified",
      Value: "true",
    },
    {
      Name: "sub",
      Value: "0d4e3b53-07c8-42c8-9a26-c7dbf7eee027",
    },
  ],
  Username: "0d4e3b53-07c8-42c8-9a26-c7dbf7eee027",
};

// return all of the possible responses
export const userResponses: TestUserData[] = [
  ...stateSubmitters,
  ...reviewers,
  ...helpDeskUsers,
  ...readOnlyUsers,
  noRoleUser,
];

// return an array of all usernames
export default userResponses.map((response) => ({ username: response.Username }));

export const TEST_STATE_SUBMITTER_USER = convertUserAttributes(makoStateSubmitter);
export const TEST_CO_STATE_SUBMITTER_USER = convertUserAttributes(coStateSubmitter);
export const TEST_CMS_REVIEWER_USER = convertUserAttributes(makoReviewer);
export const TEST_HELP_DESK_USER = convertUserAttributes(helpDeskUser);
export const TEST_READ_ONLY_USER = convertUserAttributes(readOnlyUser);
export const TEST_SUPER_USER = convertUserAttributes(superReviewer);

export * from "./cmsReviewer";
export * from "./helpDeskUsers";
export * from "./mockStorage";
export * from "./readOnlyCMSUsers";
export * from "./stateSubmitters";
export * from "./idmUsers";
