import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import { APIGatewayEvent, Context } from "aws-lambda";
import { response } from "libs/handler-lib";
import { ItemResult } from "shared-types/opensearch/main";

import { fetchPackage, normalizeEvent } from "./middleware";

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
  .use(normalizeEvent({ opensearch: true })) // calls the middleware that checks for event body and adds the context type if it is missing
  .use(
    httpJsonBodyParser(), // parses the request body when it's a JSON and converts it to an object
  )
  .use(
    validator({ eventSchema: transpileSchema(eventSchema) }), // validates the event
  )
  .use(httpErrorHandler()) // handles common http errors and returns proper responses
  .use(fetchPackage({ allowNotFound: true, setToContext: true }))
  .handler(
    async (
      event: APIGatewayEvent & { body: { id: string } },
      context: Context & { packageResult: ItemResult },
    ) => {
      const { packageResult } = context;

      const exists = !(packageResult === undefined || !packageResult.found);
      return response({
        statusCode: 200,
        body: {
          message: exists ? "Record found for the given id" : "No record found for the given id",
          exists,
        },
      });
    },
  );
