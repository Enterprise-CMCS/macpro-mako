import { z } from "zod";

import { attachmentArraySchema, attachmentArraySchemaOptional } from "../attachments";
import { extendSchema } from "./base-schema";

export const temporaryExtensionIdRegex = /^[A-Z]{2}-\d{4,5}\.R\d{2}\.TE\d{2}$/;
export const approvedInitialOrRenewalWaiverIdRegex = /^[A-Z]{2}-\d{4,5}\.R\d{2}\.00$/;
export const temporaryExtensionIdFormatMessage =
  "The Temporary Extension Request Number must be in the format of SS-####.R##.TE## or SS-#####.R##.TE##";
export const approvedInitialOrRenewalWaiverIdFormatMessage =
  "The Approved Initial or Renewal Waiver Number must be in the format of SS-####.R##.00 or SS-#####.R##.00.";

export const baseSchema = z.object({
  event: z.literal("temporary-extension").default("temporary-extension"),
  id: z
    .string()
    .min(1, { message: "Required" })
    .refine((id) => temporaryExtensionIdRegex.test(id), {
      message: temporaryExtensionIdFormatMessage,
    }),
  waiverNumber: z.string().min(1, { message: "Required" }),
  authority: z.string().min(1, { message: "Required" }),
  additionalInformation: z.string().max(4000).nullable().default(null).optional(),
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

export type TemporaryExtensionSchema = z.infer<typeof baseSchema>;

export const schema = baseSchema.merge(extendSchema);
