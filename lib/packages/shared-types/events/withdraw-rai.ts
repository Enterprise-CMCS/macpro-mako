import { z } from "zod";

import { attachmentArraySchemaOptional } from "../attachments";
import { sharedSchema } from "./base-schema";

export const baseSchema = z.object({
  event: z.literal("withdraw-rai").default("withdraw-rai"),
  id: z.string(),
  authority: z.string(),
  attachments: z.object({
    supportingDocumentation: z.object({
      files: attachmentArraySchemaOptional(),
      label: z.string().default("Supporting Documentation"),
    }),
  }),
  additionalInformation: z.preprocess(
    (value) => (typeof value === "string" ? value.trimStart() : value),
    z
      .string()
      .max(4000)
      .refine((value) => value !== "", {
        message: "Additional Information is required.",
      })
      .refine((value) => value.trim().length > 0, {
        message: "Additional Information can not be only whitespace.",
      }),
  ),
});

export const schema = baseSchema.merge(sharedSchema);
