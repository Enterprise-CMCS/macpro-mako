// import { z } from "zod";
// import { attachmentSchema } from "shared-types";
// import { getAdditionalInformation } from "@/components/ActionForm/actionForm.utilities";
// import { zAdditionalInfo } from "@/utils";
// import { zAdditionalInfo, zAttachmentOptional } from "@/utils";
import { events } from "shared-types/events";

export const formSchema = events["withdraw-rai"].baseSchema.extend({
  additionalInformation: events["withdraw-rai"].baseSchema.shape.additionalInformation
  .refine((value) => value !== "", {
    message: "Additional Information is required.",
  })
  .refine((value) => value.trim().length > 0, {
    message: "Additional Information can not be only whitespace.",
  })
})