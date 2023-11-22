import { z } from "zod";
import { onemacAttachmentSchema } from "../onemac";

export const withdrawPackageEventSchema = z.object({
  id: z.string(),
  additionalInformation: z
    .string()
    .max(4000, "This field may only be up to 4000 characters.")
    .optional(),
  attachments: z.object({
    supportingDocumentation: z.array(onemacAttachmentSchema).optional(),
  }),
});
export type WithdrawPackageSchema = z.infer<typeof withdrawPackageEventSchema>;
