import { response } from "libs/handler-lib";
import { APIGatewayEvent } from "aws-lambda";
import { getPackage } from "../libs/api/package/getPackage";
import {
  getAuthDetails,
  isAuthorized,
  lookupUserAttributes,
} from "../libs/api/auth/user";
import { getAvailableActions } from "shared-utils";
import { Action } from "shared-types";
import {
  respondToRai,
  toggleRaiResponseWithdraw,
  updateId,
  withdrawPackage,
  withdrawRai,
  removeAppkChild,
} from "./package-actions";

export const handler = async (event: APIGatewayEvent) => {
  if (!event.pathParameters || !event.pathParameters.actionType) {
    return response({
      statusCode: 400,
      body: { message: "Action type path parameter required" },
    });
  }
  if (!event.body) {
    return response({
      statusCode: 400,
      body: { message: "Event body required" },
    });
  }

  try {
    const actionType = event.pathParameters.actionType as Action;
    const body = JSON.parse(event.body);

    // Check auth
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
      authDetails.poolId,
    );

    // Check that the package action is available
    const actions: Action[] = getAvailableActions(userAttr, result._source);
    console.log("ACTIONTYPE: " + actionType);
    console.log("AVAILABLE ACTION: " + actions);
    if (!actions.includes(actionType)) {
      return response({
        statusCode: 401,
        body: {
          message: `You are not authorized to perform ${actionType} on ${body.id}`,
        },
      });
    }

    // Call package action
    switch (actionType) {
      case Action.WITHDRAW_PACKAGE:
        await withdrawPackage(body);
        break;
      case Action.RESPOND_TO_RAI:
        await respondToRai(body, result._source);
        break;
      case Action.ENABLE_RAI_WITHDRAW:
        await toggleRaiResponseWithdraw({ toggle: true, ...body });
        break;
      case Action.DISABLE_RAI_WITHDRAW:
        await toggleRaiResponseWithdraw(body);
        break;
      case Action.WITHDRAW_RAI:
        await withdrawRai(body, result._source);
        break;
      case Action.UPDATE_ID:
        await updateId(body);
        break;
      case Action.REMOVE_APPK_CHILD:
        await removeAppkChild(body);
        break;
      default:
        throw `No ${actionType} action available`;
    }
    return response({
      statusCode: 200,
      body: { message: "success" },
    });
  } catch (error) {
    console.error({ error });
    return response({
      statusCode: 500,
      body: { message: "Internal server error" },
    });
  }
};
