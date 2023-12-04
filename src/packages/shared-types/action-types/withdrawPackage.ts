import { z, ZodArray } from "zod";
import { onemacAttachmentSchema } from "../onemac";

export const withdrawPackageSchema = (attachmentArrayType: ZodArray<any>) =>
  z.object({
    additionalInformation: z
      .string()
      .max(4000, "This field may only be up to 4000 characters.")
      .optional(),
    attachments: z.object({
      supportingDocumentation: attachmentArrayType.optional(),
    }),
  });

export const withdrawPackageEventSchema = withdrawPackageSchema(
  z.array(onemacAttachmentSchema)
);
export type WithdrawPackageEventSchema = z.infer<
  typeof withdrawPackageEventSchema
>;
