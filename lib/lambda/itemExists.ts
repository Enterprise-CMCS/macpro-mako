import { APIGatewayEvent } from "shared-types";
import { z } from "zod";

import { ContextWithPackage, fetchPackage, nonAuthenticatedMiddy } from "./middleware";

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

export const handler = nonAuthenticatedMiddy({
  opensearch: true,
  eventSchema: itemExistsEventSchema,
})
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
