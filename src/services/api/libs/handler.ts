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
  return () => response;
};

export const response = (
  currentResponse: APIGatewayProxyResult,
  options?: { disableCors?: boolean }
) => {
  const corsHeaders = {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE",
  };

  return {
    ...currentResponse,
    headers: {
      ...currentResponse.headers,
      ...(options?.disableCors ? {} : corsHeaders),
    },
  };
};
