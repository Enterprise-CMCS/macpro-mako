import { z } from "zod";
import { onemacAttachmentSchema } from "./../attachments";

// This is the event schema we can expect streaming from legacy onemac.
// It should be used by the sink to safe parse and then transform before publishing to opensearch.
export const onemacLegacySchema = z.object({
  additionalInformation: z.string().nullable().default(null),
  submitterName: z.string(),
  submitterEmail: z.string(),
  attachments: z.array(onemacAttachmentSchema).nullish(),
  raiWithdrawEnabled: z.boolean().default(false),
});
export type OnemacLegacy = z.infer<typeof onemacLegacySchema>;
