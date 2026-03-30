import { APIGatewayEvent } from "shared-types";
import { opensearch } from "shared-types";
import { z } from "zod";

import { sendAttachmentArchiveRebuildRequest } from "../attachment-archive/rebuild-queue";
import { getRequestedAttachmentArchiveStatus } from "./attachmentArchive-lib";
import {
  authenticatedMiddy,
  canViewPackage,
  ContextWithPackage,
  fetchChangelog,
  fetchPackage,
} from "./middleware";

const getAttachmentArchiveEventSchema = z
  .object({
    body: z
      .object({
        id: z.string(),
        scope: z.enum(["all", "section"]),
        sectionId: z.string().optional(),
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

export const handler = authenticatedMiddy({
  opensearch: true,
  setToContext: true,
  eventSchema: getAttachmentArchiveEventSchema,
})
  .use(fetchPackage({ setToContext: true }))
  .use(canViewPackage())
  .use(fetchChangelog({ setToContext: true }))
  .handler(async (event: GetAttachmentArchiveEvent, context: ContextWithPackage) => {
    const body = event.body;
    const changelog =
      (
        context.packageResult?._source as
          | { changelog?: opensearch.changelog.ItemResult[] }
          | undefined
      )?.changelog || [];

    const result = await getRequestedAttachmentArchiveStatus({
      packageId: body.id,
      scope: body.scope,
      sectionId: body.sectionId,
      changelog,
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
        packageId: body.id,
        latestTimestamp,
        source: "request",
      });
    }

    return {
      statusCode: 200,
      body: result.response,
    };
  });
