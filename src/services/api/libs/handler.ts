import type {
  APIGatewayEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import * as middy from "middy";
import { cors } from "middy/middlewares";

export const handler = (
  handler: (
    event?: APIGatewayEvent,
    context?: Context
  ) => Promise<APIGatewayProxyResult>
) => middy(handler).use(cors());
