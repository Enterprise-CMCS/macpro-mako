import type { APIGatewayEvent } from "aws-lambda";

export const handler = async ({
  pathParameters,
  body: _body,
}: APIGatewayEvent) => {
  const { id } = pathParameters;

  return {
    statusCode: 200,
    body: JSON.stringify({ post: `Post with ${id} was edited` }),
  };
};
