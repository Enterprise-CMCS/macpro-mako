import { useQuery } from "@tanstack/react-query";
import { Auth } from "aws-amplify";
import { CognitoUserAttributes } from "shared-types";
import { isCmsUser } from "shared-utils";

export type OneMacUser = {
  isCms?: boolean;
  user: CognitoUserAttributes | null;
};

export const getUser = async (): Promise<OneMacUser> => {
  try {
    const currentAuthenticatedUser = await Auth.currentAuthenticatedUser();
    const userAttributesArray = await Auth.userAttributes(
      currentAuthenticatedUser,
    );
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
    userAttributesObj["custom:cms-roles"] =
      userAttributesObj?.["custom:cms-roles"] || "";
    userAttributesObj.username = currentAuthenticatedUser?.username || "";

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
