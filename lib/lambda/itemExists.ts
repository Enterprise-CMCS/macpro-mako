import { APIGatewayEvent, SEATOOL_STATUS } from "shared-types";
import { z } from "zod";

import { authenticatedMiddy, canViewPackage, ContextWithPackage, fetchPackage } from "./middleware";

const itemExistsEventSchema = z
  .object({
    body: z
      .object({
        id: z.string().trim().min(1),
        includeDrafts: z.boolean().optional(),
      })
      .strict(),
  })
  .passthrough();

export type ItemExistsEvent = APIGatewayEvent & z.infer<typeof itemExistsEventSchema>;

export const handler = authenticatedMiddy({
  opensearch: true,
  setToContext: true,
  eventSchema: itemExistsEventSchema,
})
  .use(fetchPackage({ allowNotFound: true, setToContext: true }))
  .use(canViewPackage())
  .handler(async (event: ItemExistsEvent, context: ContextWithPackage) => {
    const { packageResult } = context;

    const includeDrafts = Boolean(event.body?.includeDrafts);
    const hasPackage = !(packageResult === undefined || !packageResult.found);
    const isDeleted = packageResult?._source?.deleted === true;
    const isDraft = packageResult?._source?.seatoolStatus === SEATOOL_STATUS.DRAFT;
    const exists = hasPackage && !isDeleted && (includeDrafts || !isDraft);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: exists ? "Record found for the given id" : "No record found for the given id",
        exists,
        ...(includeDrafts && hasPackage && !isDeleted
          ? { status: packageResult?._source?.seatoolStatus }
          : {}),
      }),
    };
  });
