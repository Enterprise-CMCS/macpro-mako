import { APIGatewayEvent } from "shared-types";
import { opensearch, SEATOOL_STATUS } from "shared-types";
import { isCmsUser, isHelpDeskUser } from "shared-utils";
import { z } from "zod";

import { buildDraftAttachmentChangelog } from "../attachment-archive/draft-package";
import { sendAttachmentArchiveRebuildRequest } from "../attachment-archive/rebuild-queue";
import { getDraftPackage, getPackage, getPackageChangelog } from "../libs/api/package";
import {
  isActiveDraftPackage,
  isActiveMainNonDraftPackage,
} from "../libs/api/package/packageStatus";
import { getRequestedAttachmentArchiveStatus } from "./attachmentArchive-lib";
import { authenticatedMiddy, ContextWithAuthenticatedUser } from "./middleware";

const getAttachmentArchiveEventSchema = z
  .object({
    body: z
      .object({
        id: z.string(),
        scope: z.enum(["all", "section"]),
        sectionId: z.string().optional(),
        preferDraft: z.boolean().optional(),
      })
      .strict()
      .superRefine((value, ctx) => {
        if (value.scope === "section" && !value.sectionId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "sectionId is required when scope is 'section'",
            path: ["sectionId"],
          });
        }
      }),
  })
  .passthrough();

export type GetAttachmentArchiveEvent = APIGatewayEvent &
  z.infer<typeof getAttachmentArchiveEventSchema>;

const getPackageChangelogFilter = (packageResult: opensearch.main.ItemResult) => {
  const filter = [];
  const legacySubmissionTimestamp = (
    packageResult._source as { legacySubmissionTimestamp?: string }
  )?.legacySubmissionTimestamp;

  if (legacySubmissionTimestamp !== null && legacySubmissionTimestamp !== undefined) {
    filter.push({
      range: {
        timestamp: {
          gte: new Date(legacySubmissionTimestamp).getTime(),
        },
      },
    });
  }

  return filter;
};

async function resolvePackageForArchive(packageId: string, preferDraft?: boolean) {
  const mainResult = await getPackage(packageId);
  const hasActiveMainNonDraft = isActiveMainNonDraftPackage(mainResult);
  const draftResult = await getDraftPackage(packageId);
  const hasActiveDraft = isActiveDraftPackage(draftResult);

  return preferDraft === true && hasActiveDraft
    ? draftResult
    : hasActiveMainNonDraft
      ? mainResult
      : hasActiveDraft
        ? draftResult
        : undefined;
}

export const handler = authenticatedMiddy({
  opensearch: true,
  setToContext: true,
  eventSchema: getAttachmentArchiveEventSchema,
}).handler(async (event: GetAttachmentArchiveEvent, context: ContextWithAuthenticatedUser) => {
  const body = event.body;
  const packageId = body.id.trim().toUpperCase();
  const authenticatedUser = context.authenticatedUser;

  if (!authenticatedUser) {
    return {
      statusCode: 401,
      body: { message: "User is not authenticated" },
    };
  }

  const resolvedPackage = await resolvePackageForArchive(packageId, body.preferDraft);

  if (!resolvedPackage || !resolvedPackage.found) {
    return {
      statusCode: 404,
      body: { message: "No record found for the given id" },
    };
  }

  const packageState = resolvedPackage._source?.state?.toUpperCase();
  const isDraftPackage = resolvedPackage._source?.seatoolStatus === SEATOOL_STATUS.DRAFT;
  const isCmsReviewer = isCmsUser(authenticatedUser);
  const isHelpDesk = isHelpDeskUser(authenticatedUser);

  if (isDraftPackage && isCmsReviewer && !isHelpDesk) {
    return {
      statusCode: 403,
      body: { message: "Not authorized to view this resource" },
    };
  }

  if (
    !isCmsReviewer &&
    packageState &&
    !authenticatedUser.states?.includes(packageState)
  ) {
    return {
      statusCode: 403,
      body: { message: "Not authorized to view this resource" },
    };
  }

  const changelog = isDraftPackage
    ? buildDraftAttachmentChangelog({
        packageId,
        submission: resolvedPackage._source,
      })
    : ((await getPackageChangelog(packageId, getPackageChangelogFilter(resolvedPackage))).hits
        .hits as opensearch.changelog.ItemResult[]);

  const result = await getRequestedAttachmentArchiveStatus({
    packageId,
    scope: body.scope,
    sectionId: body.sectionId,
    changelog,
    archiveNamespace: isDraftPackage ? "draft" : "main",
  });

  if (result.needsRebuild) {
    const latestTimestamp = changelog.reduce<number | undefined>((latest, item) => {
      const timestamp = item._source?.timestamp;
      if (typeof timestamp !== "number") {
        return latest;
      }

      return latest === undefined ? timestamp : Math.max(latest, timestamp);
    }, undefined);

    await sendAttachmentArchiveRebuildRequest({
      packageId,
      latestTimestamp,
      preferDraft: isDraftPackage || undefined,
      source: "request",
    });
  }

  return {
    statusCode: 200,
    body: result.response,
  };
});
