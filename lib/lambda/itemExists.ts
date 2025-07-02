import { zodValidator } from "@dannywrayuk/middy-zod-validator";
import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { APIGatewayEvent } from "shared-types";
import { z } from "zod";

import { ContextWithPackage, fetchPackage, normalizeEvent } from "./middleware";

const itemExistsEventSchema = z
  .object({
    body: z
      .object({
        id: z.string(),
      })
      .strict(),
  })
  .passthrough();

export type ItemExistsEvent = APIGatewayEvent & z.infer<typeof itemExistsEventSchema>;

export const handler = middy()
  .use(httpErrorHandler()) // handles common http errors and returns proper responses
  .use(normalizeEvent({ opensearch: true })) // calls the middleware that checks for event body and adds the context type if it is missing
  .use(
    httpJsonBodyParser(), // parses the request body when it's a JSON and converts it to an object
  )
  .use(
    zodValidator({ eventSchema: itemExistsEventSchema }), // validates the event
  )
  .use(fetchPackage({ allowNotFound: true, setToContext: true }))
  .handler(async (event: ItemExistsEvent, context: ContextWithPackage) => {
    const { packageResult } = context;

    const exists = !(packageResult === undefined || !packageResult.found);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: exists ? "Record found for the given id" : "No record found for the given id",
        exists,
      }),
    };
  });
