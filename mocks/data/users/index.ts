import { CognitoUserAttributes } from "shared-types";
import { UserRole } from "shared-types/events/legacy-user";

import { convertUserAttributes } from "../../handlers/auth.utils";
import type { TestUserDataWithRole } from "../../index.d";
import { makoReviewer, reviewers, reviewerUsernamesByEmail, superReviewer } from "./cmsReviewer";
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
  makoStateSubmitter,
  stateSubmitters,
  stateSubmitterUsernamesByEmail,
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
  ...stateSubmitters,
  ...reviewers,
  ...cmsUsers,
  ...helpDeskUsers,
  noRoleUser,
];

export const usernamesByEmail = {
  ...stateSubmitterUsernamesByEmail,
  ...reviewerUsernamesByEmail,
  ...cmsUserUsernamesByEmail,
  ...helpDeskUserUsernamesByEmail,
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

export const TEST_STATE_SUBMITTER_USER = convertUserAttributes(makoStateSubmitter);
export const TEST_CO_STATE_SUBMITTER_USER = convertUserAttributes(coStateSubmitter);
export const TEST_CMS_REVIEWER_USER = convertUserAttributes(makoReviewer);
export const TEST_HELP_DESK_USER = convertUserAttributes(helpDeskUser);
export const TEST_DEFAULT_CMS_USER = convertUserAttributes(defaultCMSUser);
export const TEST_CMS_ROLE_APPROVER_USER = convertUserAttributes(cmsRoleApprover);
export const TEST_SYSTEM_ADMIN_USER = convertUserAttributes(systemAdmin);
export const TEST_SUPER_USER = convertUserAttributes(superReviewer);

export * from "./cmsReviewer";
export * from "./helpDeskUsers";
export * from "./mockStorage";
export * from "./otherCMSUsers";
export * from "./stateSubmitters";
export * from "./idmUsers";
