import { http } from "msw";
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
      console.log({
        user: userAttributesObj,
        isCms: isCmsUser(userAttributesObj),
      });

      return {
        user: userAttributesObj,
        isCms: isCmsUser(userAttributesObj),
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

export const useDefaultStateSubmitter = () => setMockUsername(makoStateSubmitter.Username);

export const useDefaultReviewer = () => setMockUsername(makoReviewer.Username);

// const getUsernameFromAccessToken = (accessToken?: string): string | undefined => {
//   console.log({ accessToken });
//   if (accessToken) {
//     const decoded = jwt.decode(accessToken, { json: true });
//     console.log({ decoded });
//     return decoded?.sub;
//   }
//   return undefined;
// };

const findUserByUsername = (username: string): CognitoUserResponse | undefined =>
  userResponses.find((user) => user.Username == username);

export type IdpRequestBody = {
  AccessToken: string;
};

const loginHandler = http.get("/", ({ request }) => {
  console.log("handling / page ", { request });
});

export const defaultHandler = [loginHandler];
// export const defaultHandler = [identityProviderServiceHandler, identityServiceHandler];
