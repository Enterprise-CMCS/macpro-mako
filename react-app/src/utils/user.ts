import { STATE_CODES, StateCode } from "shared-types/states";
import { FullUser } from "shared-types/user";
import { isCmsUser } from "shared-utils";

import { getUser } from "@/api";

export const getUserStateCodes = (user: FullUser | null | undefined): StateCode[] => {
  console.log("what is the user", user);
  // We always need a user, and state users always need a custom:state value
  if (!user) return [];
  return isCmsUser(user) ? [...STATE_CODES] : ((user.states ?? []) as StateCode[]);
};
export const isAuthorizedState = async (id: string) => {
  try {
    const user = await getUser();
    if (!user.user) throw Error("No cognito attributes found.");
    return getUserStateCodes(user.user).includes(id.substring(0, 2) as StateCode);
  } catch (e) {
    console.error(e);
    return false;
  }
};
