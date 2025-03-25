import { useQuery } from "@tanstack/react-query";
import { Auth } from "aws-amplify";
import { CognitoUserAttributes } from "shared-types";
import { isCmsUser } from "shared-utils";
import config from "@/config";

import ReactGA from "react-ga4"


export type OneMacUser = {
  isCms?: boolean;
  user: CognitoUserAttributes | null;
  counties?: { label: string; value: string }[];
};

export const getUser = async (): Promise<OneMacUser> => {

  try {

    const googleAnalyticsGtag = config.googleAnalytics?.GOOGLE_ANALYTICS_ID;
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

    // gtag('config', 'YOUR_MEASUREMENT_ID', {
    //   'user_properties': {
    //     'user_role': 'state-user'
    //   }
    // });
    
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







  