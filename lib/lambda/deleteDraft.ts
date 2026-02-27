import { response } from "libs/handler-lib";
import * as os from "libs/opensearch-lib";
import { getDomainAndNamespace } from "libs/utils";
import { APIGatewayEvent, SEATOOL_STATUS } from "shared-types";
import { isStateUser } from "shared-utils";
import { z } from "zod";

import {
  authenticatedMiddy,
  canViewPackage,
  ContextWithAuthenticatedUser,
  ContextWithPackage,
  fetchPackage,
} from "./middleware";

const deleteDraftEventSchema = z
  .object({
    body: z
      .object({
        id: z.string(),
      })
      .strict(),
  })
  .passthrough();

export type DeleteDraftEvent = APIGatewayEvent & z.infer<typeof deleteDraftEventSchema>;
type DeleteDraftContext = ContextWithPackage & ContextWithAuthenticatedUser;

export const handler = authenticatedMiddy({
  opensearch: true,
  setToContext: true,
  eventSchema: deleteDraftEventSchema,
})
  .use(fetchPackage({ setToContext: true }))
  .use(canViewPackage())
  .handler(async (_event: DeleteDraftEvent, context: DeleteDraftContext) => {
    const { authenticatedUser, packageResult } = context;

    if (!authenticatedUser || !isStateUser(authenticatedUser)) {
      return response({
        statusCode: 403,
        body: { message: "Only state users can delete drafts." },
      });
    }

    if (!packageResult || !packageResult.found || !packageResult._source) {
      return response({
        statusCode: 404,
        body: { message: "No record found for the given id" },
      });
    }

    const submission = packageResult._source;
    if (submission.deleted || submission.seatoolStatus !== SEATOOL_STATUS.DRAFT) {
      return response({
        statusCode: 409,
        body: { message: `Package ${submission.id} is not an active draft.` },
      });
    }

    const timestamp = new Date().toISOString();
    const { domain, index } = getDomainAndNamespace("main");

    await os.updateData(domain, {
      index,
      id: submission.id,
      refresh: true,
      body: {
        doc: {
          deleted: true,
          changedDate: timestamp,
          makoChangedDate: timestamp,
          statusDate: timestamp,
        },
        doc_as_upsert: false,
      },
    });

    return response({
      statusCode: 200,
      body: { message: "Draft deleted", id: submission.id },
    });
  });
