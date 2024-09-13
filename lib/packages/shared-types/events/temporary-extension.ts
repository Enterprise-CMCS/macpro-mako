import { z } from "zod";
import {
  attachmentArraySchema,
  attachmentArraySchemaOptional,
} from "../attachments";

export const baseSchema = z.object({
  event: z.literal("temporary-extension").default("temporary-extension"),
  id: z
    .string()
    .min(1, { message: "Required" })
    .refine((id) => /^[A-Z]{2}-\d{4,5}\.R\d{2}\.TE\d{2}$/.test(id), {
      message:
        "The Temporary Extension Request Number must be in the format of SS-####.R##.TE## or SS-#####.R##.TE##",
    }),
  waiverNumber: z
    .string()
    .min(1, { message: "Required" })
    .refine((id) => /^[A-Z]{2}-\d{4,5}\.R\d{2}\.00$/.test(id), {
      message:
        "The Approved Initial or Renewal Waiver Number must be in the format of SS-####.R##.00 or SS-#####.R##.00.",
    }),
  authority: z.string(), // z.enum?
  additionalInformation: z.string().max(4000).nullable().default(null),
  attachments: z.object({
    waiverExtensionRequest: z.object({
      label: z.string().default("Waiver Extension Request"),
      files: attachmentArraySchema(),
    }),
    other: z.object({
      label: z.string().default("Other"),
      files: attachmentArraySchemaOptional(),
    }),
  }),
});

export const schema = baseSchema.extend({
  actionType: z.string().default("Extend"),
  origin: z.literal("mako").default("mako"),
  submitterName: z.string(),
  submitterEmail: z.string().email(),
  timestamp: z.number(),
});
