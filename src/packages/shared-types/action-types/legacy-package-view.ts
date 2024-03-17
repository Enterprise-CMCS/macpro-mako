import { z } from "zod";
import { legacyAttachmentSchema } from "../attachments";

// Event schema for legacy package actions
export const legacyPackageViewSchema = z.object({
  additionalInformation: z.string().nullable().default(null),
  submitterName: z.string(),
  submitterEmail: z.string(),
  attachments: z.array(legacyAttachmentSchema).nullish(),
  raiWithdrawEnabled: z.boolean().default(false),

  submissionTimestamp: z.number().nullish(),
  GSI1pk: z.string(),
  parentId: z.string().nullable().optional(),
  temporaryExtensionType: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
});
export type LegacyPackageAction = z.infer<typeof legacyPackageViewSchema>;
