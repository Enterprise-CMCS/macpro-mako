import {
  getDraftPackage,
  isActiveDraftPackage,
  isActiveMainNonDraftPackage,
} from "libs/api/package";
import { APIGatewayEvent } from "shared-types";
import { isCmsUser, isHelpDeskUser } from "shared-utils";
import { z } from "zod";

import {
  authenticatedMiddy,
  canViewPackage,
  ContextWithAuthenticatedUser,
  ContextWithPackage,
  fetchPackage,
} from "./middleware";

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
  .handler(
    async (event: ItemExistsEvent, context: ContextWithPackage & ContextWithAuthenticatedUser) => {
      const { packageResult, authenticatedUser } = context;

      const includeDrafts = Boolean(event.body?.includeDrafts);
      const isCms = Boolean(authenticatedUser && isCmsUser(authenticatedUser));
      const isHelpDesk = Boolean(authenticatedUser && isHelpDeskUser(authenticatedUser));
      const hasActiveMainNonDraft = isActiveMainNonDraftPackage(packageResult);

      const shouldFetchDraftIndex = includeDrafts && (!isCms || isHelpDesk);
      const draftPackage = shouldFetchDraftIndex
        ? await getDraftPackage(event.body?.id?.toUpperCase())
        : undefined;
      const hasActiveDraftPackage = isActiveDraftPackage(draftPackage);

      const exists = includeDrafts
        ? hasActiveMainNonDraft || hasActiveDraftPackage
        : hasActiveMainNonDraft;

      const status = hasActiveMainNonDraft
        ? packageResult?._source?.seatoolStatus
        : hasActiveDraftPackage
          ? draftPackage?._source?.seatoolStatus
          : undefined;

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: exists ? "Record found for the given id" : "No record found for the given id",
          exists,
          ...(includeDrafts && status ? { status } : {}),
        }),
      };
    },
  );
