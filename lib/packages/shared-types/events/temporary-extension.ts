import { z } from "zod";
import {
  attachmentArraySchema,
  attachmentArraySchemaOptional,
} from "../attachments";

export const temporaryExtensionFeSchema = z.object({
  id: z.string(),
  authority: z.string(),
  seaActionType: z.string().default("Extend"),
  originalWaiverNumber: z.number(),
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
