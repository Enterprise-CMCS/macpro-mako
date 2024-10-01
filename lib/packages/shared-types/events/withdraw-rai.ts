import { z } from "zod";
import {
  attachmentArraySchemaOptional,
  attachmentSchema,
} from "../attachments";

export const raiWithdrawSchema = z.object({
  id: z.string(),
  authority: z.string(),
  attachments: z.array(attachmentSchema).nullish(),
  additionalInformation: z.string().nullable().default(null),
});
export type RaiWithdraw = z.infer<typeof raiWithdrawSchema>;

//
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
  additionalInformation: z
    .string()
    .nullable()
    .default(null),
  });

export const schema = baseSchema.extend({
  origin: z.literal("mako").default("mako"),
  submitterName: z.string(),
  submitterEmail: z.string().email(),
  timestamp: z.number(),
})

// export type RaiWithdraw = z.infer<typeof baseSchema>;
