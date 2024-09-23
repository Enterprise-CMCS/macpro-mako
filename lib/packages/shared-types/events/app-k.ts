import { z } from "zod";
import {
  attachmentArraySchema,
  attachmentArraySchemaOptional,
} from "../attachments";

export const appkSchema = z.object({
  state: z.string(),
  waiverIds: z.array(z.string()).min(1),
  proposedEffectiveDate: z.date(),
  seaActionType: z.string().default("Amend"),
  title: z.string().trim().min(1, { message: "Required" }),
  attachments: z.object({
    appk: z.object({
      label: z.string().default("1915(c) Appendix K Amendment Waiver Template"),
      files: attachmentArraySchema(),
    }),
    other: z.object({
      label: z.string().default("Other"),
      files: attachmentArraySchemaOptional(),
    }),
  }),
  additionalInformation: z.string().max(4000).nullable().default(null),
});
