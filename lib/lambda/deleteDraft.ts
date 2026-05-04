import { getDraftPackage } from "libs/api/package";
import { response } from "libs/handler-lib";
import * as os from "libs/opensearch-lib";
import { getDomainAndNamespace } from "libs/utils";
import { APIGatewayEvent, SEATOOL_STATUS } from "shared-types";
import { isStateUser } from "shared-utils";
import { z } from "zod";

import { authenticatedMiddy, ContextWithAuthenticatedUser } from "./middleware";

const deleteDraftEventSchema = z
  .object({
    body: z
      .object({
        id: z.string().trim().min(1),
      })
      .strict(),
  })
  .passthrough();

export type DeleteDraftEvent = APIGatewayEvent & z.infer<typeof deleteDraftEventSchema>;
type DeleteDraftContext = ContextWithAuthenticatedUser;

const isVersionConflictError = (error: unknown) => {
  if (error && typeof error === "object") {
    const osType = (error as { meta?: { body?: { error?: { type?: string } } } }).meta?.body?.error
      ?.type;
    if (osType === "version_conflict_engine_exception") {
      return true;
    }
  }

  if (error instanceof Error) {
    return error.message.includes("version_conflict_engine_exception");
  }

  return false;
};

const normalizeEmail = (email?: string) => email?.trim().toLowerCase();

const canDeleteDraft = (
  submission: {
    draft?: { createdByEmail?: string; draftOwnerEmail?: string; updatedByEmail?: string };
    submitterEmail?: string;
  },
  userEmail?: string,
) => {
  const actorEmail = normalizeEmail(userEmail);
  if (!actorEmail) {
    return false;
  }

  const authorizedEmails = [
    submission.draft?.createdByEmail,
    submission.draft?.draftOwnerEmail,
    submission.draft?.updatedByEmail,
    submission.submitterEmail,
  ]
    .map(normalizeEmail)
    .filter((email): email is string => Boolean(email));

  return authorizedEmails.includes(actorEmail);
};

export const handler = authenticatedMiddy({
  opensearch: true,
  setToContext: true,
  eventSchema: deleteDraftEventSchema,
}).handler(async (event: DeleteDraftEvent, context: DeleteDraftContext) => {
  const { authenticatedUser } = context;

  if (!authenticatedUser || !isStateUser(authenticatedUser)) {
    return response({
      statusCode: 403,
      body: { message: "Only state users can delete drafts." },
    });
  }

  const id = event.body.id.toUpperCase();

  const stateCode = id.slice(0, 2);
  const userStates = authenticatedUser.states?.map((state) => state.toUpperCase()) || [];
  if (!userStates.includes(stateCode)) {
    return response({
      statusCode: 403,
      body: { message: "Not authorized to view this resource" },
    });
  }

  const packageResult = await getDraftPackage(id);

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

  if (!canDeleteDraft(submission, authenticatedUser.email)) {
    return response({
      statusCode: 403,
      body: { message: "Not authorized to view this resource" },
    });
  }

  const timestamp = new Date().toISOString();
  const { domain, index } = getDomainAndNamespace("draftmain");
  const hasVersionData =
    typeof packageResult._seq_no === "number" && typeof packageResult._primary_term === "number";

  try {
    await os.updateData(domain, {
      index,
      id: submission.id,
      refresh: true,
      ...(hasVersionData && {
        if_seq_no: packageResult._seq_no,
        if_primary_term: packageResult._primary_term,
      }),
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
  } catch (error) {
    if (isVersionConflictError(error)) {
      return response({
        statusCode: 409,
        body: {
          message: "Draft was updated by another user. Refresh this page and try deleting again.",
        },
      });
    }

    throw error;
  }

  return response({
    statusCode: 200,
    body: { message: "Draft deleted", id: submission.id },
  });
});
