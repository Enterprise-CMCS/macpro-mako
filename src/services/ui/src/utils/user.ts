import { CognitoUserAttributes } from "shared-types";
import { isCmsUser } from "shared-utils";
import { STATES } from "@/consts";

export const getUserStateCodes = (
  user: CognitoUserAttributes | null | undefined
) => {
  if (!user) return [];

  if (isCmsUser(user)) {
    return STATES;
  }

  if (!user["custom:state"]) {
    return [];
  }

  return user["custom:state"]?.split(",");
};
