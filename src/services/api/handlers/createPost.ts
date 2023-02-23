import type { APIGatewayEvent } from "aws-lambda";
import * as middy from "middy";
import { cors } from "middy/middlewares";

export const handler = middy(async (event: APIGatewayEvent) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ post: {} }),
  };
}).use(cors());
