import { z } from "zod";
import { isAuthorizedState } from "@/utils";
import { idIsUnique } from "@/api";

export const zSpaIdSchema = z
  .string()
  .regex(
    /^[A-Z]{2}-\d{2}-\d{4}(-[A-Z0-9]{1,4})?$/,
    "ID doesn't match format SS-YY-NNNN or SS-YY-NNNN-XXXX"
  )
  .refine((value) => isAuthorizedState(value), {
    message:
      "You can only submit for a state you have access to. If you need to add another state, visit your IDM user profile to request access.",
  })
  .refine(async (value) => idIsUnique(value), {
    message:
      "According to our records, this SPA ID already exists. Please check the SPA ID and try entering it again.",
  });

export const zFileAttachmentOptional = z.array(z.instanceof(File)).optional();

export const zFileAttachmentRequired = ({
  min,
  max = 9999,
  message = "Required",
}: {
  min: number;
  max?: number;
  message?: string;
}) =>
  z
    .array(z.instanceof(File))
    .refine((value) => value.length >= min && value.length <= max, {
      message: message,
    });

export const zAdditionalInfo = z
  .string()
  .max(4000, "This field may only be up to 4000 characters.");
