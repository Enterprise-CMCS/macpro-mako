import { reviewers } from "./cmsReviewer";
import { helpDeskUsers } from "./helpDeskUsers";
import { readOnlyUsers } from "./readOnlyCMSUsers";
import { stateSubmitters } from "./stateSubmitters";

export type CognitoUserResponse = {
  UserAttributes: {
    Name: string;
    Value: string;
  }[];
  Username: string;
};

export const noRoleUser = {
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
      Value: "",
    },
  ],
  Username: "", // TODO
};

// return all of the possible responses
export const userResponses = [
  ...stateSubmitters,
  ...reviewers,
  ...helpDeskUsers,
  ...readOnlyUsers,
  noRoleUser,
];

// return an array of all usernames
export default userResponses.map((response) => ({ username: response.Username }));

export * from "./cmsReviewer";
export * from "./helpDeskUsers";
export * from "./mockStorage";
export * from "./readOnlyCMSUsers";
export * from "./stateSubmitters";
