import type {
  APIGatewayEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";

export const handler = async (
  handler: (
    event?: APIGatewayEvent,
    context?: Context
  ) => Promise<APIGatewayProxyResult>
) => {
  const handlerResponse = await handler();

  const response: APIGatewayProxyResult = {
    headers: {
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE",
    },
    ...handlerResponse,
  };
  return response;
};
