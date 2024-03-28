import { z } from "zod";
import { attachmentSchema } from "../attachments";
import { notificationMetadataSchema } from "../notification-metadata";

export const raiResponseSchema = z.object({
  id: z.string(),
  authority: z.string(),
  origin: z.string(),
  requestedDate: z.number(),
  responseDate: z.number(),
  attachments: z.array(attachmentSchema).nullish(),
  additionalInformation: z.string().nullable().default(null),
  submitterName: z.string(),
  submitterEmail: z.string(),
  notificationMetadata: notificationMetadataSchema.nullish(),
});
export type RaiResponse = z.infer<typeof raiResponseSchema>;
