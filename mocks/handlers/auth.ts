import type { TestUserData } from "index.d";
import { CognitoUserAttributes } from "shared-types";
import { isCmsUser } from "shared-utils";
import { makoReviewer, makoStateSubmitter, userResponses } from "../data/users";

export const setMockUsername = (user?: TestUserData | string | null): void => {
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

export const mockCurrentAuthenticatedUser = (): TestUserData | undefined => {
  if (process.env.MOCK_USER_USERNAME) {
    return findUserByUsername(process.env.MOCK_USER_USERNAME);
  }
  return undefined;
};

export const mockUserAttributes = async (currentAuthenticatedUser: TestUserData | unknown) => {
  if (
    currentAuthenticatedUser &&
    (currentAuthenticatedUser as TestUserData).UserAttributes !== undefined
  ) {
    return (currentAuthenticatedUser as TestUserData).UserAttributes;
  }

  if (process.env.MOCK_USER_USERNAME) {
    const user = findUserByUsername(process.env.MOCK_USER_USERNAME);
    return user?.UserAttributes;
  }
  return undefined;
};

export const mockUseGetUser = () => {
  if (process.env.MOCK_USER_USERNAME) {
    const user = findUserByUsername(process.env.MOCK_USER_USERNAME);
    if (user) {
      // Copied from useGetUser.getUser
      // Set object up with key/values from attributes array
      const userAttributesObj = user.UserAttributes
        ? user.UserAttributes.reduce(
            (obj, item) =>
              item?.Name && item?.Value
                ? {
                    ...obj,
                    [item.Name]: item.Value,
                  }
                : obj,
            {} as CognitoUserAttributes,
          )
        : ({} as CognitoUserAttributes);
      // Manual additions and normalizations
      userAttributesObj["custom:cms-roles"] = userAttributesObj["custom:cms-roles"] || "";

      userAttributesObj.username = user.Username || "";

      return {
        data: {
          user: userAttributesObj,
          isCms: isCmsUser(userAttributesObj),
        },
        isLoading: false,
        isSuccess: true,
      };
    }
  }
  return {
    data: null,
    isLoading: false,
    isSuccess: true,
  };
};

const findUserByUsername = (username: string): TestUserData | undefined =>
  userResponses.find((user) => user.Username == username);
