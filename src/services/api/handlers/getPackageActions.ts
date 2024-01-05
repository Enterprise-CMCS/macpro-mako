import { APIGatewayEvent } from "aws-lambda";
import { getAvailableActions } from "shared-utils";
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

export const getPackageActions = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return response({
      statusCode: 400,
      body: { message: "Event body required" },
    });
  }
  const body = JSON.parse(event.body) as GetPackageActionsBody;
  try {
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
        actions: getAvailableActions(userAttr, result._source),
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
