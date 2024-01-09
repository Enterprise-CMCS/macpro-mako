import { response } from "@/shared/lambda-response";
import { type APIGatewayEvent } from "aws-lambda";
import { ActionTypes } from "shared-types";
import { withdrawRaiLambda } from "./withdraw-rai-lambda";
import { enableRaiWithdrawLambda } from "./enable-rai-withdraw-lambda";
import { issueRaiLambda } from "./issue-rai-lambda";
import { respondToRaiLambda } from "./respond-to-rai-lambda";
import { APIError } from "../services/error-handle-service";
import { withdrawPackageLambda } from "./withdraw-package-lambda";
import { isAuthorized } from "@/libs/auth/user";
import { getPackage } from "@/libs/package/getPackage";

type Routes = Record<
  ActionTypes,
  Promise<ReturnType<typeof response> | string | undefined>
>;

export const router = async (event: APIGatewayEvent) => {
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

  const body = JSON.parse(event.body);

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

  const actionType = event.pathParameters.actionType as ActionTypes;

  const routes: Routes = {
    "withdraw-rai": withdrawRaiLambda(event),
    "disable-rai-withdraw": enableRaiWithdrawLambda(event),
    "enable-rai-withdraw": enableRaiWithdrawLambda(event),
    "issue-rai": issueRaiLambda(event),
    "respond-to-rai": respondToRaiLambda(event),
    "withdraw-package": withdrawPackageLambda(event),
  };

  try {
    return await routes[actionType];
  } catch (error: unknown) {
    if (error instanceof APIError) {
      return response({
        statusCode: 500,
        body: {
          message: error.message,
        },
      });
    }
  }
};
