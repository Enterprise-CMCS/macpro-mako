import { z } from "zod";
import {
  attachmentArraySchema,
  attachmentArraySchemaOptional,
} from "../attachments";

export const appkSchema = z.object({
  id: z.string(),
  state: z.string().transform((_, ctx: any) => {
    const id = ctx.input.id as string;
    return id.slice(0, 2).toUpperCase();
  }),
  actionType: z.string().default("New"),
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

export const schema = appkSchema.extend({
  origin: z.literal("mako").default("mako"),
  applicationEndpointUrl: z.string(),
  submitterName: z.string(),
  submitterEmail: z.string().email(),
  timestamp: z.number(),
});
