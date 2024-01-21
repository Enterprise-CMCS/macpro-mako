import { z } from "zod";
import { onemacAttachmentSchema } from "../attachments";

export const raiResponseSchema = z.object({
  id: z.string(),
  authority: z.string(),
  origin: z.string(),
  requestedDate: z.number(),
  responseDate: z.number(),
  attachments: z.array(onemacAttachmentSchema).nullish(),
  additionalInformation: z.string().nullable().default(null),
  submitterName: z.string(),
  submitterEmail: z.string(),
});
export type RaiResponse = z.infer<typeof raiResponseSchema>;
