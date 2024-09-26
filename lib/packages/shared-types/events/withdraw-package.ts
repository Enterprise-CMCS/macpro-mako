import { z } from "zod";
import { attachmentSchema } from "../attachments";

// Temporary, will be refactored to an extendable schema with Brian/Mike's back-end
// work.
export const withdrawPackageSchema = z.object({
  id: z.string(),
  authority: z.string(),
  origin: z.string(),
  additionalInformation: z
    .string()
    .max(4000, "This field may only be up to 4000 characters.")
    .optional(),
  attachments: z.array(attachmentSchema).nullish(),
  submitterName: z.string(),
  submitterEmail: z.string(),
  timestamp: z.number().optional(),
  submissionDate: z.number().optional(),
});

export type WithdrawPackage = z.infer<typeof withdrawPackageSchema>;
