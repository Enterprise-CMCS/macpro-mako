import { CognitoUserAttributes } from "shared-types";
import { isCmsUser } from "shared-utils";
import {
  CognitoUserResponse,
  makoReviewer,
  makoStateSubmitter,
  userResponses,
} from "../data/users";

export const setMockUsername = (username: string): void => {
  if (username) {
    process.env.MOCK_USER_USERNAME = username;
  } else {
    delete process.env.MOCK_USER_USERNAME;
  }
};

export const useDefaultStateSubmitter = () => setMockUsername(makoStateSubmitter.Username);

export const useDefaultReviewer = () => setMockUsername(makoReviewer.Username);

export const mockCurrentAuthenticatedUser = async () => {
  if (process.env.MOCK_USER_USERNAME) {
    const user = findUserByUsername(process.env.MOCK_USER_USERNAME);
    if (user) {
      return {
        username: user.Username,
        attributes: user.UserAttributes,
        preferredMFA: "NOMFA",
      };
    }
    return undefined;
  }
  return undefined;
};

export const mockUserAttributes = async (currentAuthenticatedUser: any) => {
  if (currentAuthenticatedUser?.currentAuthenticatedUser?.attributes) {
    return currentAuthenticatedUser.currentAuthenticatedUser.attributes;
  }
  if (process.env.MOCK_USER_USERNAME) {
    const user = findUserByUsername(process.env.MOCK_USER_USERNAME);
    if (user) {
      return user.UserAttributes;
    }
  }
  return undefined;
};

export const mockUseGetUser = async () => {
  if (process.env.MOCK_USER_USERNAME) {
    const user = findUserByUsername(process.env.MOCK_USER_USERNAME);
    if (user) {
      // Set object up with key/values from attributes array
      const userAttributesObj = user?.UserAttributes?.reduce(
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
      userAttributesObj["custom:cms-roles"] = userAttributesObj?.["custom:cms-roles"] || "";

      userAttributesObj.username = user?.Username || "";

      return {
        user: userAttributesObj,
        isCms: isCmsUser(userAttributesObj),
      };
    }
    return undefined;
  }
  return undefined;
};

const findUserByUsername = (username: string): CognitoUserResponse | undefined =>
  userResponses.find((user) => user.Username == username);
