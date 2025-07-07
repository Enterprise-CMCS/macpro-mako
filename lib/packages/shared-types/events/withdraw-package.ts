import { z } from "zod";

import { attachmentArraySchema, attachmentArraySchemaOptional } from "../attachments";
import { sharedSchema } from "./base-schema";

export const attachmentsDefault = z.object({
  supportingDocumentation: z.object({
    files: attachmentArraySchemaOptional(),
    label: z.string().default("Supporting Documentation"),
  }),
});
export const attachmentsChip = z.object({
  officialWithdrawalLetter: z.object({
    files: attachmentArraySchema(),
    label: z.string().default("Official Withdrawal Letter"),
  }),
});

export const baseSchema = z.object({
  event: z.literal("withdraw-package").default("withdraw-package"),
  id: z.string(),
  authority: z.string(),
  additionalInformation: z.string().trim().max(4000).optional(),
  attachments: attachmentsDefault.or(attachmentsChip),
  eventDoneBy: z.string(),
});

export const schema = baseSchema.merge(sharedSchema);
