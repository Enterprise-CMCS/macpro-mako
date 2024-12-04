import { z } from "zod";
import {
  attachmentArraySchema,
  attachmentArraySchemaOptional,
} from "../attachments";

export const baseSchema = z.object({
  event: z.literal("contracting-amendment").default("contracting-amendment"),
  authority: z.string().default("1915(b)"),
  id: z
    .string()
    .min(1, { message: "Required" })
    .refine((id) => /^[A-Z]{2}-\d{4,5}\.R\d{2}\.(?!00)\d{2}$/.test(id), {
      message:
        "The 1915(b) Waiver Amendment Number must be in the format of SS-####.R##.## or SS-#####.R##.##. For amendments, the last two digits start with '01' and ascends.",
    }),
  proposedEffectiveDate: z.number(),
  attachments: z.object({
    b4WaiverApplication: z.object({
      label: z
        .string()
        .default(
          "1915(b)(4) FFS Selective Contracting (Streamlined) Waiver Application Pre-print",
        ),
      files: attachmentArraySchema(),
    }),
    tribalConsultation: z.object({
      label: z.string().default("Tribal Consultation"),
      files: attachmentArraySchemaOptional(),
    }),
    other: z.object({
      label: z.string().default("Other"),
      files: attachmentArraySchemaOptional(),
    }),
  }),
  additionalInformation: z
    .string()
    .max(4000)
    .nullable()
    .default(null)
    .optional(),
  waiverNumber: z
    .string()
    .min(1, { message: "Required" })
    .refine((id) => /^[A-Z]{2}-\d{4,5}\.R\d{2}\.\d{2}$/.test(id), {
      message:
        "The approved 1915(b) Initial or Renewal Number must be in the format of SS-####.R##.## or SS-#####.R##.##.",
    }),
});

export const schema = baseSchema.extend({
  actionType: z.string().default("Amend"),
  origin: z.literal("mako").default("mako"),
  submitterName: z.string(),
  submitterEmail: z.string().email(),
  timestamp: z.number(),
  deleted: z.boolean().default(false),
});
