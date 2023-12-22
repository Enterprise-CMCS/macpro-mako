import { z } from "zod";
import { onemacAttachmentSchema, handleAttachment } from "./attachments";

// This is the event schema we can expect streaming from legacy onemac.
// It should be used by the sink to safe parse and then transform before publishing to opensearch.
export const onemacLegacySchema = z.object({
  additionalInformation: z.string().nullable().default(null),
  submitterName: z.string(),
  submitterEmail: z.string(),
  attachments: z.array(onemacAttachmentSchema).nullish(),
  raiWithdrawEnabled: z.boolean().default(false),
  raiResponses: z
    .array(
      z.object({
        additionalInformation: z.string().nullable().default(null),
        submissionTimestamp: z.number(),
        attachments: z.array(onemacAttachmentSchema).nullish(),
      })
    )
    .nullish(),
});
export type OnemacLegacy = z.infer<typeof onemacLegacySchema>;
// There's an issue here.
// So this is currently appropiriately transforming the event for the main index
// But we'll need a way to also process this legacy rai data and get it into the changelog index, or aggregate it somehow else.
// I'd like to avoid modifying the producer in onemac legacy.
export const transformOnemacLegacy = (id: string) => {
  return onemacLegacySchema.transform((data) => ({
    id,
    attachments:
      data.attachments?.map((attachment) => {
        return handleAttachment(attachment);
      }) ?? null,
    raiWithdrawEnabled: data.raiWithdrawEnabled,
    additionalInformation: data.additionalInformation,
    submitterEmail: data.submitterEmail,
    submitterName: data.submitterName === "-- --" ? null : data.submitterName,
    origin: "oneMAC",
  }));
};
export type OnemacLegacyTransform = z.infer<
  ReturnType<typeof transformOnemacLegacy>
>;
