import { z } from "zod";
import { attachmentSchema } from "../attachments";

// Temporary, will be refactored to an extendable schema with Brian/Mike's back-end
// work.
export const withdrawPackageSchema = z.object({
  id: z.string(),
  state: z.string().transform((_, ctx: any) => {
    const id = ctx.input.id as string;
    return id.slice(0, 2).toUpperCase();
  }),
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
