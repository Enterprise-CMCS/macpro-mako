import { z } from "zod";
import { onemacAttachmentSchema, handleAttachment } from "./attachments";

// This is the event schema for ne submissions from our system
export const onemacSchema = z.object({
  authority: z.string(),
  origin: z.string(),
  additionalInformation: z.string().nullable().default(null),
  submitterName: z.string(),
  submitterEmail: z.string(),
  attachments: z.array(onemacAttachmentSchema).nullish(),
  raiWithdrawEnabled: z.boolean().default(false),
});

export type OneMac = z.infer<typeof onemacSchema>;

export const transformOnemac = (id: string) => {
  return onemacSchema.transform((data) => {
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
export type OnemacTransform = z.infer<ReturnType<typeof transformOnemac>>;

export type OnemacRecordsToDelete = Omit<
  {
    [Property in keyof OnemacTransform]: null;
  },
  "id"
> & { id: string };
