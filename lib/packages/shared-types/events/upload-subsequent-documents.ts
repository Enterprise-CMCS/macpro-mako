import { z } from "zod";

import { attachmentArraySchemaOptional } from "../attachments";
import { sharedSchema } from "./base-schema";

export const baseSchema = z.object({
  event: z.literal("upload-subsequent-documents").default("upload-subsequent-documents"),
  additionalInformation: z.string().max(4000),
  attachments: z.record(
    z.string(),
    z.object({
      files: attachmentArraySchemaOptional(),
      label: z.string(),
    }),
  ),
  id: z.string(),
  authority: z.string(),
});

export const schema = baseSchema.merge(sharedSchema);
