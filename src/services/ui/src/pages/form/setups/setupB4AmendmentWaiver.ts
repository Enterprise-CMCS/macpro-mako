import { z } from "zod";
import { zAdditionalInfo } from "@/pages/form/zod";
import { FormSetup } from "@/lib";

export default {
  schema: z.object({
    attachments: z.object({}),
    additionalInformation: zAdditionalInfo,
  }),
  attachments: [],
} as FormSetup;
