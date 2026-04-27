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
  fetchAppkChildren,
  fetchChangelog,
  fetchPackage,
} from "./middleware";

const itemEventSchema = z
  .object({
    body: z
      .object({
        id: z.string().trim().min(1),
        includeDraft: z.boolean().optional(),
        preferDraft: z.boolean().optional(),
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
  .use(fetchPackage({ allowNotFound: true, rethrowErrors: true, setToContext: true }))
  .use(canViewPackage())
  .use(fetchAppkChildren({ setToContext: true }))
  .use(fetchChangelog({ setToContext: true }))
  .handler(async (event: ItemEvent, context: ContextWithPackage & ContextWithAuthenticatedUser) => {
    const { packageResult, authenticatedUser } = context;

    if (event.body?.includeDraft === true && event.body?.preferDraft === true) {
      const draftPackageResult = await getDraftPackage(event.body.id.toUpperCase());
      const isActiveDraft = isActiveDraftPackage(draftPackageResult);

      if (
        draftPackageResult &&
        isActiveDraft &&
        (!authenticatedUser || !isCmsUser(authenticatedUser) || isHelpDeskUser(authenticatedUser))
      ) {
        return {
          statusCode: 200,
          body: {
            ...draftPackageResult,
            _source: {
              ...draftPackageResult._source,
              changelog: draftPackageResult._source?.changelog ?? [],
            },
          },
        };
      }
    }

    const isActiveMainNonDraft = isActiveMainNonDraftPackage(packageResult);

    if (isActiveMainNonDraft) {
      return {
        statusCode: 200,
        body: packageResult,
      };
    }

    if (event.body?.includeDraft === true) {
      const draftPackageResult = await getDraftPackage(event.body.id.toUpperCase());
      const isActiveDraft = isActiveDraftPackage(draftPackageResult);

      if (
        draftPackageResult &&
        isActiveDraft &&
        (!authenticatedUser || !isCmsUser(authenticatedUser) || isHelpDeskUser(authenticatedUser))
      ) {
        return {
          statusCode: 200,
          body: {
            ...draftPackageResult,
            _source: {
              ...draftPackageResult._source,
              changelog: draftPackageResult._source?.changelog ?? [],
            },
          },
        };
      }
    }

    return {
      statusCode: 404,
      body: JSON.stringify({ message: "No record found for the given id" }),
    };
  });
