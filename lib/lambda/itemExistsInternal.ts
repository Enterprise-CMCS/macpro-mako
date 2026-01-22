import { itemExists as itemExistsInSearch } from "libs/api/package";
import { APIGatewayEvent } from "shared-types";
import { z } from "zod";

import { nonAuthenticatedMiddy } from "./middleware";

const itemExistsEventSchema = z
  .object({
    body: z
      .object({
        id: z.string(),
      })
      .strict(),
  })
  .passthrough();

export type ItemExistsInternalEvent = APIGatewayEvent & z.infer<typeof itemExistsEventSchema>;

export const handler = nonAuthenticatedMiddy({
  opensearch: true,
  eventSchema: itemExistsEventSchema,
}).handler(async (event: ItemExistsInternalEvent) => {
  const { id } = event.body;

  const exists = await itemExistsInSearch({ id });

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: exists ? "Record found for the given id" : "No record found for the given id",
      exists,
    }),
  };
});
