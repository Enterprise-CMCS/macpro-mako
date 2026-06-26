import { useQuery } from "@tanstack/react-query";
import { Auth } from "aws-amplify";
import { CognitoUserAttributes, FullUser } from "shared-types";
import { isCmsUser } from "shared-utils";

import { getUserDetails } from "./useGetUserDetails";

export type OneMacUser = {
  isCms?: boolean;
  user: FullUser | null;
  counties?: { label: string; value: string }[];
};

const USER_QUERY_STALE_TIME_MS = 5 * 60 * 1000;

export const getUser = async (): Promise<OneMacUser> => {
  try {
    const currentAuthenticatedUser = await Auth.currentAuthenticatedUser();
    const userDetails = await getUserDetails();

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
      user: { ...userAttributesObj, role: userDetails.role, states: userDetails.states ?? [] },
      isCms: isCmsUser({ ...userAttributesObj, role: userDetails.role }),
    } satisfies OneMacUser;
  } catch (e) {
    console.log({ e });

    return { user: null } satisfies OneMacUser;
  }
};

export const userQueryOptions = {
  queryKey: ["user"],
  queryFn: getUser,
  staleTime: USER_QUERY_STALE_TIME_MS,
  refetchOnWindowFocus: false,
};

export const useGetUser = () => useQuery<OneMacUser>(userQueryOptions);
