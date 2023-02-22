import type { APIGatewayEvent } from "aws-lambda";

export const handler = async ({ pathParameters }: APIGatewayEvent) => {
  const { id } = pathParameters;

  return {
    statusCode: 200,
    body: JSON.stringify({ id }),
  };
};
