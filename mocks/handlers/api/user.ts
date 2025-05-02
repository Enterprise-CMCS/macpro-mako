import { CognitoUserAttribute } from "amazon-cognito-identity-js";
import { isCmsUser } from "shared-utils";

import type { TestUserDataWithRole } from "../..";
import { convertUserAttributes, findUserByUsername } from "../auth.utils";

// using `any` type here because the function that this is mocking uses any
export const mockCurrentAuthenticatedUser = (): TestUserDataWithRole | any => {
  if (process.env.MOCK_USER_USERNAME) {
    return findUserByUsername(process.env.MOCK_USER_USERNAME);
  }
  return undefined;
};

// using any here because the function that this is mocking uses any
export const mockUserAttributes = async (user: any): Promise<CognitoUserAttribute[]> => {
  if (user && (user as TestUserDataWithRole).UserAttributes !== undefined) {
    return (user as TestUserDataWithRole).UserAttributes as CognitoUserAttribute[];
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
