import { events } from "shared-types/events";
import { z } from "zod";

export const formSchema = events["withdraw-package"].baseSchema.superRefine(
  (data, ctx) => {
    if (
      !data.attachments.supportingDocumentation?.files.length &&
      (data.additionalInformation === undefined ||
        data.additionalInformation === "")
    ) {
      ctx.addIssue({
        message: "An Attachment or Additional Information is required.",
        code: z.ZodIssueCode.custom,
        fatal: true,
      });
      // Zod says this is to appease types
      // https://github.com/colinhacks/zod?tab=readme-ov-file#type-refinements
      return z.NEVER;
    }
  },
);
