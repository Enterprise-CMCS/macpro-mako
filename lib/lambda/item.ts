import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import { APIGatewayEvent, Context } from "aws-lambda";
import { ItemResult } from "shared-types/opensearch/main";

import {
  canViewPackage,
  fetchAppkChildren,
  fetchChangelog,
  fetchPackage,
  isAuthenticated,
  normalizeEvent,
} from "./middleware";

const eventSchema = {
  type: "object",
  properties: {
    body: {
      type: "object",
      required: ["id"],
      properties: {
        id: {
          type: "string",
        },
      },
    },
  },
};

export const handler = middy()
  .use(httpErrorHandler())
  .use(normalizeEvent({ opensearch: true }))
  .use(httpJsonBodyParser())
  .use(validator({ eventSchema: transpileSchema(eventSchema) }))
  .use(isAuthenticated())
  .use(fetchPackage({ setToContext: true }))
  .use(canViewPackage())
  .use(fetchAppkChildren({ setToContext: true }))
  .use(fetchChangelog({ setToContext: true }))
  .handler(
    async (
      event: APIGatewayEvent & { body: { id: string } },
      context: Context & { packageResult: ItemResult },
    ) => {
      const { packageResult } = context;

      return {
        statusCode: 200,
        body: JSON.stringify(packageResult),
      };
    },
  );
