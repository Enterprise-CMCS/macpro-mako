import { APIGatewayEvent } from "shared-types";
import { z } from "zod";

import {
  authenticatedMiddy,
  canViewPackage,
  ContextWithPackage,
  fetchAppkChildren,
  fetchChangelog,
  fetchPackage,
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

export const handler = authenticatedMiddy({
  opensearch: true,
  setToContext: true,
  eventSchema: itemEventSchema,
})
  .use(canViewPackage())
  .use(fetchPackage({ setToContext: true }))
  .use(fetchAppkChildren({ setToContext: true }))
  .use(fetchChangelog({ setToContext: true }))
  .handler(async (event: ItemEvent, context: ContextWithPackage) => {
    const { packageResult } = context;

    return {
      statusCode: 200,
      body: packageResult,
    };
  });
