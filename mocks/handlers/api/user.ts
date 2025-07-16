import { CognitoUserAttribute } from "amazon-cognito-identity-js";
import { isCmsUser } from "shared-utils";

import type { TestUserDataWithRole } from "../../index";
import { convertUserAttributes, findUserByUsername, getMockUsername } from "../auth.utils";

// using `any` type here because the function that this is mocking uses any
export const mockCurrentAuthenticatedUser = (): TestUserDataWithRole | any => {
  const username = getMockUsername();
  if (username) {
    return findUserByUsername(username);
  }
  return undefined;
};

// using any here because the function that this is mocking uses any
export const mockUserAttributes = async (user: any): Promise<CognitoUserAttribute[]> => {
  if (user && (user as TestUserDataWithRole).UserAttributes !== undefined) {
    return (user as TestUserDataWithRole).UserAttributes as CognitoUserAttribute[];
  }

  const username = getMockUsername();
  if (username) {
    const defaultUser = findUserByUsername(username);
    return defaultUser?.UserAttributes as CognitoUserAttribute[];
  }
  return {} as CognitoUserAttribute[];
};

export const mockUseGetUser = () => {
  const username = getMockUsername();
  if (username) {
    const user = findUserByUsername(username);
    if (user) {
      // Copied from useGetUser.getUser
      // Set object up with key/values from attributes array
      const userAttributesObj = convertUserAttributes(user);
      const userWithRole = {
        ...userAttributesObj,
        role: user.role,
      };

      return {
        data: {
          user: userWithRole,
          isCms: isCmsUser(userWithRole),
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
