import { z } from "zod";

const makoAttachmentSchema = z.object({
  key: z.string(),
  bucket: z.string(),
  date: z.number(),
  title: z.string(),
  contentType: z.string(),
});

const raiSchema = z.object({
  additionalInformation: z.string().nullable().default(null),
  submissionTimestamp: z.number(),
  attachments: z.array(makoAttachmentSchema),
});
export const makoSchema = z.object({
  additionalInformation: z.string().nullable().default(null),
  submitterName: z.string(),
  submitterEmail: z.string(),
  attachments: z.array(makoAttachmentSchema).nullish(),
  raiResponses: z.array(raiSchema).nullish(),
  origin: z.string(),
});

export const transformMako = (id: string) => {
  return makoSchema.transform((data) => ({
    id,
    attachments: data.attachments,
    raiResponses: data.raiResponses,
    additionalInformation: data.additionalInformation,
    submitterEmail: data.submitterEmail,
    submitterName: data.submitterName,
    origin: data.origin,
  }));
};

export type MakoSink = z.infer<typeof makoSchema>;
export type MakoTransform = z.infer<ReturnType<typeof transformMako>>;
export type MakoAttachment = z.infer<typeof makoAttachmentSchema>;
export type MakoRecordsToDelete = Omit<
  {
    [Property in keyof MakoTransform]: undefined;
  },
  "id"
> & { id: string };
