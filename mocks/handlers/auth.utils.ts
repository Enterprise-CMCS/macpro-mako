import { makoReviewer, makoStateSubmitter, userResponses } from "../data/users";
import type { TestUserData } from "../index.d";
import { CognitoUserAttributes } from "shared-types";

export const setMockUsername = (user?: TestUserData | string | null): void => {
  console.log({ user });
  if (user && typeof user === "string") {
    process.env.MOCK_USER_USERNAME = user;
  } else if (user && (user as TestUserData).Username !== undefined) {
    process.env.MOCK_USER_USERNAME = (user as TestUserData).Username;
  } else {
    delete process.env.MOCK_USER_USERNAME;
  }
};

export const setDefaultStateSubmitter = () => setMockUsername(makoStateSubmitter);

export const setDefaultReviewer = () => setMockUsername(makoReviewer);

export const findUserByUsername = (username: string): TestUserData | undefined =>
  userResponses.find((user) => user.Username == username);

export const convertUserAttributes = (user: TestUserData): CognitoUserAttributes => {
  if (user?.UserAttributes) {
    const userAttributesObj = user.UserAttributes.reduce(
      (obj, item) =>
        item?.Name && item?.Value
          ? {
              ...obj,
              [item.Name]: item.Value,
            }
          : obj,
      {} as CognitoUserAttributes,
    );
    // Manual additions and normalizations
    userAttributesObj["custom:cms-roles"] = userAttributesObj["custom:cms-roles"] || "";

    userAttributesObj.username = user.Username || "";

    return userAttributesObj;
  }

  return {} as CognitoUserAttributes;
};
