import { CognitoUserAttributes, STATE_CODES, StateCode } from "shared-types";
import { isCmsUser, isStateUser } from "shared-utils";
import { getUser } from "@/api/useGetUser";
import {
  opensearch,
  stateUserSubStatus
} from "shared-types";
import { PackageCheck } from "shared-utils";

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
    console.log(getUserStateCodes(user.user));
    return getUserStateCodes(user.user).includes(
      id.substring(0, 2) as StateCode
    );
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const getStateStatusWithSubStatus = (data: opensearch.main.Document): { status: string, subStatus: string | null } => {
  const checker = PackageCheck(data);

  if (checker.hasEnabledRaiWithdraw) {
    return {
      status: data.stateStatus,
      subStatus: stateUserSubStatus.WITHDRAW_FORMAL_RAI_RESPONSE_ENABLED
    };
  }

  // by default we return subStatus as null
  return {
    status: data.stateStatus,
    subStatus: null
  };
};

export const getCmsStatusWithSubStatus = (data: opensearch.main.Document): { status: string, subStatus: string | null } => {
  const checker = PackageCheck(data);

  if (checker.hasEnabledRaiWithdraw) {
    return {
      status: data.cmsStatus,
      subStatus: stateUserSubStatus.WITHDRAW_FORMAL_RAI_RESPONSE_ENABLED
    };
  }

  // we return substatus as null, if there is no sub status 
  return {
    status: data.cmsStatus,
    subStatus: null
  };
};