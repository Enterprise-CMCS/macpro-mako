import { z } from "zod";
import { isAuthorizedState } from "@/utils";
import { getItem } from "@/api";

async function doesNotExist(value: string) {
  try {
    await getItem(value);
    return false;
  } catch (error) {
    return true;
  }
}

export const zSpaIdSchema = z
  .string()
  .regex(
    /^[A-Z]{2}-\d{2}-\d{4}(-[A-Z0-9]{1,4})?$/,
    "ID doesn't match format SS-YY-NNNN or SS-YY-NNNN-XXXX"
  )
  .refine((value) => isAuthorizedState(value), {
    message: "You do not have access to this state.",
  })
  .refine(async (value) => doesNotExist(value), {
    message: "SPA ID already exists.",
  });

export const zAttachmentOptional = z.array(z.instanceof(File)).optional();

export const zAttachmentRequired = ({ min }: { min: number }) =>
  z.array(z.instanceof(File)).refine((value) => value.length > min, {
    message: "Required",
  });
