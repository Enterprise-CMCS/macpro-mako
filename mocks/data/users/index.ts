import { CognitoUserAttributes } from "shared-types";
import { UserRole } from "shared-types/events/legacy-user";

import { convertUserAttributes } from "../../handlers/auth.utils";
import type { TestUserDataWithRole } from "../../index.d";
import { reviewers, reviewerUsernamesByEmail, testReviewer } from "./cmsReviewer";
import { helpDeskUser, helpDeskUsers, helpDeskUserUsernamesByEmail } from "./helpDeskUsers";
import {
  cmsRoleApprover,
  cmsUsers,
  cmsUserUsernamesByEmail,
  defaultCMSUser,
  systemAdmin,
} from "./otherCMSUsers";
import {
  coStateSubmitter,
  osStateSystemAdmin,
  stateSubmitters,
  stateSubmitterUsernamesByEmail,
  testStateSubmitter,
} from "./stateSubmitters";

export const NO_ROLE_USER_EMAIL = "badfootball@example.com";
export const NO_ROLE_USER_USERNAME = "0d4e3b53-07c8-42c8-9a26-c7dbf7eee027";

export const noRoleUser: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: NO_ROLE_USER_EMAIL,
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
      Value: NO_ROLE_USER_USERNAME,
    },
  ],
  Username: NO_ROLE_USER_USERNAME,
  role: "" as UserRole,
  states: [],
};

// return all of the possible responses
export const userResponses: TestUserDataWithRole[] = [
  ...cmsUsers,
  ...helpDeskUsers,
  ...reviewers,
  ...stateSubmitters,
  noRoleUser,
];

export const usernamesByEmail = {
  ...cmsUserUsernamesByEmail,
  ...helpDeskUserUsernamesByEmail,
  ...reviewerUsernamesByEmail,
  ...stateSubmitterUsernamesByEmail,
  [NO_ROLE_USER_EMAIL]: NO_ROLE_USER_USERNAME,
};

// return an array of all usernames
export default userResponses.map((response) => ({ username: response.Username }));

export const getUserByUsername = (id: string) => {
  const user = userResponses.find((user) => user?.Username === id);
  if (user) {
    return convertUserAttributes(user);
  }
  return {} as CognitoUserAttributes;
};

export const TEST_REVIEWER_USER = convertUserAttributes(testReviewer);
export const CMS_ROLE_APPROVER_USER = convertUserAttributes(cmsRoleApprover);
export const CO_STATE_SUBMITTER_USER = convertUserAttributes(coStateSubmitter);
export const DEFAULT_CMS_USER = convertUserAttributes(defaultCMSUser);
export const HELP_DESK_USER = convertUserAttributes(helpDeskUser);
export const TEST_STATE_SUBMITTER_USER = convertUserAttributes(testStateSubmitter);
export const TEST_STATE_SYSTEM_ADMIN_USER = convertUserAttributes(osStateSystemAdmin);
export const TEST_SYSTEM_ADMIN_USER = convertUserAttributes(systemAdmin);

export * from "./cmsReviewer";
export * from "./helpDeskUsers";
export * from "./idmUsers";
export * from "./otherCMSUsers";
export * from "./stateSubmitters";
