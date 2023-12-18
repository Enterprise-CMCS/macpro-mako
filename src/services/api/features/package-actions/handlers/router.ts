import { response } from "@/shared/lambda-response";
import { type APIGatewayEvent } from "aws-lambda";
import { ActionTypes } from "shared-types";
import { withdrawRaiLambda } from "./withdraw-rai-lambda";
import { enableRaiWithdrawLambda } from "./enable-rai-withdraw-lambda";

type Routes = Record<
  ActionTypes,
  Promise<ReturnType<typeof response> | undefined>
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

  const actionType = event.pathParameters.actionType as ActionTypes;

  const routes: Routes = {
    "withdraw-rai": withdrawRaiLambda(event),
    "disable-rai-withdraw": enableRaiWithdrawLambda(event),
    "enable-rai-withdraw": enableRaiWithdrawLambda(event),
    "issue-rai": withdrawRaiLambda(event),
    "respond-to-rai": withdrawRaiLambda(event),
    "withdraw-package": withdrawRaiLambda(event),
  };

  return await routes[actionType];
};
