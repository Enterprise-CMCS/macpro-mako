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
});
export type OnemacLegacy = z.infer<typeof onemacLegacySchema>;

export const transformOnemacLegacy = (id: string) => {
  return onemacLegacySchema.transform((data) => {
    const transformedData = {
      id,
      attachments:
        data.attachments?.map((attachment) => {
          return handleAttachment(attachment);
        }) ?? null,
      raiWithdrawEnabled: data.raiWithdrawEnabled,
      additionalInformation: data.additionalInformation,
      submitterEmail: data.submitterEmail,
      submitterName: data.submitterName === "-- --" ? null : data.submitterName,
      origin: "OneMAC",
    };
    return transformedData;
  });
};
export type OnemacLegacyTransform = z.infer<
  ReturnType<typeof transformOnemacLegacy>
>;

export type OnemacLegacyRecordsToDelete = Omit<
  {
    [Property in keyof OnemacLegacyTransform]: null;
  },
  "id"
> & { id: string };
