import { CognitoUserAttributes, STATE_CODES, StateCode } from "shared-types";
import { isCmsUser, isStateUser } from "shared-utils";
import { getUser } from "@/api";

export const getUserStateCodes = (
  user: CognitoUserAttributes | null | undefined
): StateCode[] => {
  // We always need a user, and state users always need a custom:state value
  if (!user || (isStateUser(user) && user["custom:state"] === undefined))
    return [];
  return isCmsUser(user)
    ? [...STATE_CODES]
    : (user["custom:state"]!.split(",") as StateCode[]);
};
export const isAuthorizedState = async (id: string) => {
  try {
    const user = await getUser();
    if (!user.user) throw Error("No cognito attributes found.");
    return getUserStateCodes(user.user).includes(
      id.substring(0, 2) as StateCode
    );
  } catch (e) {
    console.error(e);
    return false;
  }
};
