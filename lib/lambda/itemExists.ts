import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import { APIGatewayProxyEvent } from "aws-lambda";
import { itemExists } from "libs/api/package";
import { response } from "libs/handler-lib";

import { normalizeEvent } from "./middleware";

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

export const handler = middy<APIGatewayProxyEvent, APIGatewayProxyEvent>()
  .use(normalizeEvent()) // calls the middleware that checks for event body and adds the context type if it is missing
  .use(
    httpJsonBodyParser(), // parses the request body when it's a JSON and converts it to an object
  )
  .use(
    validator({ eventSchema: transpileSchema(eventSchema) }), // validates the event
  )
  .use(httpErrorHandler()) // handles common http errors and returns proper responses;
  .handler(
    async (
      event: APIGatewayProxyEvent & { body: { id: string } },
    ): Promise<APIGatewayProxyEvent> => {
      const { id } = event.body;
      const exists = await itemExists({ id });
      return response({
        statusCode: 200,
        body: {
          message: exists ? "Record found for the given id" : "No record found for the given id",
          exists,
        },
      }) as APIGatewayProxyEvent;
    },
  );
