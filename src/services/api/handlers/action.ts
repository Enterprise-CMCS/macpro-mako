import { response } from "../libs/handler";
import { APIGatewayEvent } from "aws-lambda";
import { getPackage } from "../libs/package/getPackage";
import {
  getAuthDetails,
  isAuthorized,
  lookupUserAttributes,
} from "../libs/auth/user";
import { packageActionsForResult } from "shared-utils";
import { Action } from "shared-types";
import {
  issueRai,
  respondToRai,
  toggleRaiResponseWithdraw,
  withdrawPackage,
  withdrawRai,
} from "./packageActions";

import { withdrawRaiLambda } from "@/features/package-actions/handlers/withdraw-rai-lambda";

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
    console.log(actionType);
    console.log(body);

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
      authDetails.poolId
    );

    // Check that the package action is available
    const actions: Action[] = packageActionsForResult(userAttr, result._source);
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
      case Action.ISSUE_RAI:
        await issueRai(body);
        break;
      case Action.RESPOND_TO_RAI:
        await respondToRai(body, result._source.rais);
        break;
      case Action.ENABLE_RAI_WITHDRAW:
        await toggleRaiResponseWithdraw(body, true);
        break;
      case Action.DISABLE_RAI_WITHDRAW:
        await toggleRaiResponseWithdraw(body, false);
        break;
      case Action.WITHDRAW_RAI:
        await withdrawRaiLambda(event);
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
