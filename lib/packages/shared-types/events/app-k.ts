import { z } from "zod";
import {
  attachmentArraySchema,
  attachmentArraySchemaOptional,
} from "../attachments";

export const zAppkWaiverNumberSchema = z
  .string()
  .regex(/^\d{4,5}\.R\d{2}\.(0[1-9]|[1-9][0-9])$/);

export const appkSchema = z.object({
  id: z.string(),
  actionType: z.string().default("New"),
  state: z.string(),
  waiverIds: z.array(zAppkWaiverNumberSchema),
  proposedEffectiveDate: z.number(),
  seaActionType: z.string().default("New"),
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

export const schema = appkSchema.extend({
  origin: z.literal("mako").default("mako"),
  applicationEndpointUrl: z.string(),
  submitterName: z.string(),
  submitterEmail: z.string().email(),
  timestamp: z.number(),
});
