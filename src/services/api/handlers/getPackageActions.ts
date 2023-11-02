import { APIGatewayEvent } from "aws-lambda";
import { Action, CognitoUserAttributes, ItemResult } from "shared-types";
import { isCmsUser } from "shared-utils";
import { getPackage } from "../libs/package/getPackage";
import {
  getAuthDetails,
  isAuthorized,
  lookupUserAttributes,
} from "../libs/auth/user";
import { response } from "../libs/handler";

type GetPackageActionsBody = {
  id: string;
};

/** Generates an array of allowed actions from a combination of user attributes
 * and OS result data */
const packageActionsForResult = (
  user: CognitoUserAttributes,
  result: ItemResult
): Action[] => {
  const actions = [];
  if (isCmsUser(user)) {
    actions.push(Action.ENABLE_RAI_WITHDRAW);
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
