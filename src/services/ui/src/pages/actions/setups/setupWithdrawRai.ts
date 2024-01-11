import { z } from "zod";

export const defaultWithdrawRaiSetup = {
  schema: z.object({
    additionalInformation: z.string().max(4000),
    attachments: z.object({
      supportingDocumentation: z.array(z.instanceof(File)).nullish(),
    }),
  }),
  attachments: [
    {
      name: "supportingDocumentation",
      label: "Supporting Documentation",
      required: false,
    },
  ],
};
