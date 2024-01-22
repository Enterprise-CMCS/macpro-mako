import { z } from "zod";
import { attachmentSchema } from "../attachments";

export const raiIssueSchema = z.object({
  id: z.string(),
  authority: z.string(),
  origin: z.string(),
  requestedDate: z.number(),
  attachments: z.array(attachmentSchema).nullish(),
  additionalInformation: z.string().nullable().default(null),
  submitterName: z.string(),
  submitterEmail: z.string(),
});
export type RaiIssue = z.infer<typeof raiIssueSchema>;
