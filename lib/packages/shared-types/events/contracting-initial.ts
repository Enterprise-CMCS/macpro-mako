import { z } from "zod";
import {
  attachmentArraySchema,
  attachmentArraySchemaOptional,
} from "../attachments";

export const baseSchema = z.object({
  // zAmendmentWaiverNumberSchema
  event: z.literal("contracting-initial").default("contracting-initial"),
  authority: z.string().default("1915(b)"),
  id: z
    .string()
    .min(1, { message: "Required" })
    .refine((id) => /^[A-Z]{2}-\d{4,5}\.R00\.00$/.test(id), {
      message:
        "The Initial Waiver Number must be in the format of SS-####.R00.00 or SS-#####.R00.00",
    }),
  proposedEffectiveDate: z.number(),
  attachments: z.object({
    b4WaiverApplication: z.object({
      label: z
        .string()
        .default(
          "1915(b)(4) FFS Selective Contracting (Streamlined) Waiver Application Pre-print",
        ),
      files: attachmentArraySchema(),
    }),
    tribalConsultation: z.object({
      label: z.string().default("Tribal Consultation"),
      files: attachmentArraySchemaOptional(),
    }),
    other: z.object({
      label: z.string().default("Other"),
      files: attachmentArraySchemaOptional(),
    }),
  }),
  additionalInformation: z.string().max(4000).nullable().default(null),
});

export const schema = baseSchema
  .extend({
    actionType: z.string().default("New"),
    origin: z.literal("mako").default("mako"),
    submitterName: z.string(),
    submitterEmail: z.string().email(),
    timestamp: z.number(),
  })
  .transform((data) => ({
    ...data,
    territory: data.id.slice(0, 2).toUpperCase(),
  }));

export const successfulResponse = {
  $metadata: {
    httpStatusCode: 200,
    requestId: "d1e89223-05e6-4aad-9c7a-c93ac045e2ef",
    extendedRequestId: undefined,
    cfId: undefined,
    attempts: 1,
    totalRetryDelay: 0,
  },
  MessageId: "0100019142162cb7-62fb677b-c27e-4ccc-b3d3-20b8776a2605-000000",
};
