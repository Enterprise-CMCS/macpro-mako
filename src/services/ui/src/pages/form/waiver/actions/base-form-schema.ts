import { useFormContext } from "react-hook-form";
import { z } from "zod";

export const baseFormSchema = z.object({
  additionalInformation: z.string().min(1),
});

export const useTypeSafeBaseContext = () =>
  useFormContext<z.infer<typeof baseFormSchema>>();
