import { z } from "zod";
import { legacyAttachmentSchema } from "../attachments";

// Event schema for legacy records
export const onemacLegacySchema = z.object({
  componentId: z.string(),
  additionalInformation: z.string().nullable().default(null),
  submitterName: z.string(),
  submitterEmail: z.string(),
  attachments: z.array(legacyAttachmentSchema).nullish(),
  // todo.. are there any nulls?  can the frontend package activity handle a null timestamp?
  eventTimestamp: z.number().nullish(),
  submissionTimestamp: z.number().nullish(),
  GSI1pk: z.string(),
  parentId: z.string().nullable().optional(),
  temporaryExtensionType: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
});
export type OnemacLegacy = z.infer<typeof onemacLegacySchema>;
