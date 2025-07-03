import { zodValidator } from "@dannywrayuk/middy-zod-validator";
import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { APIGatewayEvent } from "shared-types";
import { z } from "zod";

import {
  canViewPackage,
  ContextWithPackage,
  fetchAppkChildren,
  fetchChangelog,
  fetchPackage,
  isAuthenticated,
  normalizeEvent,
} from "./middleware";

const itemEventSchema = z
  .object({
    body: z
      .object({
        id: z.string(),
      })
      .strict(),
  })
  .passthrough();

export type ItemEvent = APIGatewayEvent & z.infer<typeof itemEventSchema>;

export const handler = middy()
  .use(httpErrorHandler())
  .use(normalizeEvent({ opensearch: true }))
  .use(httpJsonBodyParser())
  .use(zodValidator({ eventSchema: itemEventSchema }))
  .use(isAuthenticated())
  .use(fetchPackage({ setToContext: true }))
  .use(canViewPackage())
  .use(fetchAppkChildren({ setToContext: true }))
  .use(fetchChangelog({ setToContext: true }))
  .handler(async (event: ItemEvent, context: ContextWithPackage) => {
    const { packageResult } = context;

    return {
      statusCode: 200,
      body: JSON.stringify(packageResult),
    };
  });
