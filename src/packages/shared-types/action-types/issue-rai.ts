import { z } from "zod";
import { onemacAttachmentSchema } from "../attachments";

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
  }));
};
export type RaiIssueTransform = z.infer<ReturnType<typeof transformRaiIssue>>;
