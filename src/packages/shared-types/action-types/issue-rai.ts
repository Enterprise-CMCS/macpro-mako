import { z } from "zod";
import { onemacAttachmentSchema, handleAttachment } from "../attachments";

export const raiIssueSchema = z.object({
  id: z.string(),
  authority: z.string(),
  origin: z.string(),
  requestedDate: z.number(),
  attachments: z.array(onemacAttachmentSchema).nullish(),
  additionalInformation: z.string().nullable().default(null),
  submitterName: z.string(),
  submitterEmail: z.string(),
});
export type RaiIssue = z.infer<typeof raiIssueSchema>;

export const transformRaiIssue = (id: string) => {
  return raiIssueSchema.transform((data) => ({
    id,
    rais: {
      [data.requestedDate]: {
        request: {
          attachments:
            data.attachments?.map((attachment) => {
              return handleAttachment(attachment);
            }) ?? null,
          additionalInformation: data.additionalInformation,
          submitterName: data.submitterName,
          submitterEmail: data.submitterEmail,
        },
      },
    },
  }));
};
export type RaiIssueTransform = z.infer<ReturnType<typeof transformRaiIssue>>;
