import { z } from "zod";
import { legacyAttachmentSchema } from "../attachments";

// Event schema for legacy package actions
export const legacyPackageViewSchema = z.object({
  additionalInformation: z.string().nullable().default(null),
  submitterName: z.string(),
  submitterEmail: z.string(),
  attachments: z.array(legacyAttachmentSchema).nullish(),
  raiWithdrawEnabled: z.boolean().default(false),
});
export type LegacyPackageAction = z.infer<typeof legacyPackageViewSchema>;
