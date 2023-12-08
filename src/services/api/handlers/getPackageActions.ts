import { APIGatewayEvent } from "aws-lambda";
import { Action, CognitoUserAttributes, ItemResult } from "shared-types";
import { isCmsUser, isCmsWriteUser, getLatestRai } from "shared-utils";
import { isStateUser } from "shared-utils/is-state-user";
import { getPackage } from "../libs/package/getPackage";
import {
  getAuthDetails,
  isAuthorized,
  lookupUserAttributes,
} from "../libs/auth/user";
import { response } from "../libs/handler";
import { SEATOOL_STATUS } from "shared-types/statusHelper";

type GetPackageActionsBody = {
  id: string;
};

/** Generates an array of allowed actions from a combination of user attributes
 * and OS result data */
export const packageActionsForResult = (
  user: CognitoUserAttributes,
  result: ItemResult
): Action[] => {
  const actions = [];
  const latestRai = getLatestRai(result._source.rais);
  if (isCmsWriteUser(user)) {
    switch (result._source.seatoolStatus) {
      case SEATOOL_STATUS.PENDING:
      case SEATOOL_STATUS.PENDING_OFF_THE_CLOCK:
      case SEATOOL_STATUS.PENDING_APPROVAL:
      case SEATOOL_STATUS.PENDING_CONCURRENCE:
        if (!latestRai || latestRai.status != "requested") {
          // If there is no RAIs, or the latest RAI is in a state other than requested
          actions.push(Action.ISSUE_RAI);
        }
        break;
    }
    if (latestRai?.status == "received") {
      // There's an RAI and its been responded to
      if (!result._source.raiWithdrawEnabled) {
        actions.push(Action.ENABLE_RAI_WITHDRAW);
      }
      if (result._source.raiWithdrawEnabled) {
        actions.push(Action.DISABLE_RAI_WITHDRAW);
      }
    }
  } else if (isStateUser(user)) {
    switch (result._source.seatoolStatus) {
      case SEATOOL_STATUS.PENDING_RAI:
        if (latestRai?.status == "requested") {
          // If there is an active RAI
          actions.push(Action.RESPOND_TO_RAI);
        }
        break;
      case SEATOOL_STATUS.PENDING:
      case SEATOOL_STATUS.PENDING_OFF_THE_CLOCK:
      case SEATOOL_STATUS.PENDING_APPROVAL:
      case SEATOOL_STATUS.PENDING_CONCURRENCE:
        if (
          latestRai?.status == "received" &&
          result._source.raiWithdrawEnabled
        ) {
          // There is an rai that's been responded to, but not withdrawn
          actions.push(Action.WITHDRAW_RAI);
        }
        break;
    }
  }
  return actions;
};
export const getPackageActions = async (event: APIGatewayEvent) => {
  const body = JSON.parse(event.body) as GetPackageActionsBody;
  try {
    console.log(body);
    const result = await getPackage(body.id);
    const passedStateAuth = await isAuthorized(event, result._source.state);
    if (!passedStateAuth)
      return response({
        statusCode: 401,
        body: { message: "Not authorized to view resources from this state" },
      });
    if (!result.found)
      return response({
        statusCode: 404,
        body: { message: "No record found for the given id" },
      });

    const authDetails = getAuthDetails(event);
    const userAttr = await lookupUserAttributes(
      authDetails.userId,
      authDetails.poolId
    );

    return response({
      statusCode: 200,
      body: {
        actions: packageActionsForResult(userAttr, result),
      },
    });
  } catch (err) {
    console.error({ err });
    return response({
      statusCode: 500,
      body: { message: "Internal server error" },
    });
  }
};

export const handler = getPackageActions;
