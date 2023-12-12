import { z } from "zod";
import { onemacAttachmentSchema } from "../attachments";

// Temporary, will be refactored to an extendable schema with Brian/Mike's back-end
// work.
export const withdrawPackageEventSchema = z.object({
  id: z.string(),
  authority: z.string(),
  origin: z.string(),
  additionalInformation: z
    .string()
    .max(4000, "This field may only be up to 4000 characters.")
    .optional(),
  attachments: z.array(onemacAttachmentSchema),
  submitterName: z.string(),
  submitterEmail: z.string(),
});

export type WithdrawPackageEventSchema = z.infer<
  typeof withdrawPackageEventSchema
>;
