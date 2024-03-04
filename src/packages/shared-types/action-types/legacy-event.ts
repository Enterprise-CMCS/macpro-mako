import { z } from "zod";
import { legacyAttachmentSchema } from "../attachments";

// Event schema for legacy records
export const onemacLegacySchema = z.object({
  additionalInformation: z.string().nullable().default(null),
  submitterName: z.string(),
  submitterEmail: z.string(),
  attachments: z.array(legacyAttachmentSchema).nullish(),
  // todo.. are there any nulls?  can the frontend package activity handle a null timestamp?
  eventTimestamp: z.number().nullish(),
  GSI1pk: z.string(),
});
export type OnemacLegacy = z.infer<typeof onemacLegacySchema>;
