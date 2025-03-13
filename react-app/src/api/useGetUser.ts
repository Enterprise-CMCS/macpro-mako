import { useQuery } from "@tanstack/react-query";
import { Amplify, Auth } from "aws-amplify";
import { CognitoUserAttributes } from "shared-types";
import { isCmsUser } from "shared-utils";

import config from "@/config";

Amplify.configure({
  Auth: {
    mandatorySignIn: true,
    region: config.cognito.REGION,
    userPoolId: config.cognito.USER_POOL_ID,
    identityPoolId: config.cognito.IDENTITY_POOL_ID,
    userPoolWebClientId: config.cognito.APP_CLIENT_ID,
    oauth: {
      domain: config.cognito.APP_CLIENT_DOMAIN,
      redirectSignIn: config.cognito.REDIRECT_SIGNIN,
      redirectSignOut: config.cognito.REDIRECT_SIGNOUT,
      scope: ["email", "openid"],
      responseType: "code",
    },
  },
  API: {
    endpoints: [
      {
        name: "os",
        endpoint: config.apiGateway.URL,
        region: config.apiGateway.REGION,
      },
    ],
  },
});

export type OneMacUser = {
  isCms?: boolean;
  user: CognitoUserAttributes | null;
  counties?: { label: string; value: string }[];
};

export const getUser = async (): Promise<OneMacUser> => {
  try {
    const currentAuthenticatedUser = await Auth.currentAuthenticatedUser();

    if (!currentAuthenticatedUser) {
      return { user: null } satisfies OneMacUser;
    }
    const userAttributesArray = (await Auth.userAttributes(currentAuthenticatedUser)) || [];

    // Set object up with key/values from attributes array
    const userAttributesObj = userAttributesArray.reduce(
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

    userAttributesObj.username =
      currentAuthenticatedUser.username || currentAuthenticatedUser.Username || "";

    return {
      user: userAttributesObj,
      isCms: isCmsUser(userAttributesObj),
    } satisfies OneMacUser;
  } catch (e) {
    console.log({ e });
    return { user: null } satisfies OneMacUser;
  }
};

export const useGetUser = () =>
  useQuery({
    queryKey: ["user"],
    queryFn: () => getUser(),
  });
