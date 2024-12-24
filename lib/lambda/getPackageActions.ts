import { APIGatewayEvent } from "aws-lambda";
import { getAvailableActions } from "shared-utils";
import { handleOpensearchError } from "./utils";
import {
  getAuthDetails,
  isAuthorizedToGetPackageActions,
  lookupUserAttributes,
} from "../libs/api/auth/user";
import { getPackage } from "../libs/api/package/getPackage";

export const getPackageActions = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return {
      statusCode: 400,
      body: { message: "Event body required" },
    };
  }

  try {
    const body = JSON.parse(event.body);

    const result = await getPackage(body.id);

    if (result === undefined || !result.found) {
      return {
        statusCode: 404,
        body: { message: "No record found for the given id" },
      };
    }

    const passedStateAuth = await isAuthorizedToGetPackageActions(event, result._source.state);

    if (!passedStateAuth)
      return {
        statusCode: 401,
        body: { message: "Not authorized to view resources from this state" },
      };

    const authDetails = getAuthDetails(event);
    const userAttr = await lookupUserAttributes(authDetails.userId, authDetails.poolId);

    return {
      statusCode: 200,
      body: {
        actions: getAvailableActions(userAttr, result._source),
      },
    };
  } catch (err) {
    return handleOpensearchError(err);
  }
};
export const handler = getPackageActions;
