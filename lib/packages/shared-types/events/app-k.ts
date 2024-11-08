import { z } from "zod";
import { attachmentArraySchema } from "../attachments";

export const baseSchema = z.object({
  event: z.literal("app-k").default("app-k"),
  authority: z.string().default("1915(c)"),
  id: z
    .string()
    .min(1, { message: "Required" })
    .refine((id) => /^[A-Z]{2}-\d{4,5}\.R\d{2}\.(?!00)\d{2}$/.test(id), {
      message:
        "The 1915(c) Waiver Amendment Number must be in the format of SS-####.R##.## or SS-#####.R##.##. For amendments, the last two digits start with '01' and ascends.",
    }),
  // still needed?
  state: z.string(),
  proposedEffectiveDate: z.date(),
  // still needed?
  seaActionType: z.string().default("Amend"),
  title: z.string().trim().min(1, { message: "Required" }),
  attachments: z.object({
    appk: z.object({
      label: z.string().default("Appendix K Template"),
      files: attachmentArraySchema({ max: 1 }),
    }),
    other: z.object({
      label: z.string().default("Other"),
      files: attachmentArraySchema({ max: 1 }),
    }),
  }),
  additionalInformation: z
    .string()
    .max(4000)
    .nullable()
    .default(null)
    .optional(),
});

export const schema = baseSchema.extend({
  // double check
  actionType: z.string().default("Amend"),
  origin: z.literal("mako").default("mako"),
  submitterName: z.string(),
  submitterEmail: z.string().email(),
  timestamp: z.number(),
});