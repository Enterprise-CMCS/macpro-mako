import { CognitoUserAttribute } from "amazon-cognito-identity-js";
import { isCmsUser } from "shared-utils";
import { findUserByUsername, convertUserAttributes } from "../auth.utils";
import type { TestUserData } from "../..";

// using `any` type here because the function that this is mocking uses any
export const mockCurrentAuthenticatedUser = (): TestUserData | any => {
  console.log("username", process.env.MOCK_USER_USERNAME);
  if (process.env.MOCK_USER_USERNAME) {
    return findUserByUsername(process.env.MOCK_USER_USERNAME);
  }
  return undefined;
};

// using any here because the function that this is mocking uses any
export const mockUserAttributes = async (user: any): Promise<CognitoUserAttribute[]> => {
  if (user && (user as TestUserData).UserAttributes !== undefined) {
    return (user as TestUserData).UserAttributes as CognitoUserAttribute[];
  }

  if (process.env.MOCK_USER_USERNAME) {
    const defaultUser = findUserByUsername(process.env.MOCK_USER_USERNAME);
    return defaultUser?.UserAttributes as CognitoUserAttribute[];
  }
  return {} as CognitoUserAttribute[];
};

export const mockUseGetUser = () => {
  if (process.env.MOCK_USER_USERNAME) {
    const user = findUserByUsername(process.env.MOCK_USER_USERNAME);
    if (user) {
      // Copied from useGetUser.getUser
      // Set object up with key/values from attributes array
      const userAttributesObj = convertUserAttributes(user);

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
