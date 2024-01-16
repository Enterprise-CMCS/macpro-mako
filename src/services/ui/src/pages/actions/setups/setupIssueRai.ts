import { z } from "zod";

export const defaultIssueRaiSetup = {
  schema: z.object({
    additionalInformation: z.string().max(4000),
    attachments: z.object({
      formalRaiLetter: z
        .array(z.instanceof(File))
        .refine((value) => value.length > 0, {
          message: "Required",
        }),
      other: z.array(z.instanceof(File)).optional(),
    }),
  }),
  attachments: [
    {
      name: "formalRaiLetter",
      label: "Formal RAI Letter",
      required: true,
    },
    {
      name: "other",
      label: "Other",
      required: false,
    },
  ],
};
