import { z } from "zod";
import {
  zAdditionalInfo,
  zAmendmentWaiverNumberSchema,
  zAttachmentOptional,
  zAttachmentRequired,
  zInitialWaiverNumberSchema,
} from "@/pages/form/zod";
import { FormSetup } from "@/lib";

export default {
  schema: z.object({
    id: zInitialWaiverNumberSchema,
    proposedEffectiveDate: z.date(),
    attachments: z.object({
      b4WaiverApplication: zAttachmentRequired({ min: 1 }),
      tribalConsultation: zAttachmentOptional,
      other: zAttachmentOptional,
    }),
    additionalInformation: zAdditionalInfo,
  }),
  attachments: [
    {
      name: "b4WaiverApplication",
      label:
        "1915(b)(4) FFS Selective Contracting (Streamlined) Waiver Application Pre-print",
      required: true,
    },
    {
      name: "tribalConsultation",
      label: "Tribal Consultation",
      required: false,
    },
    {
      name: "other",
      label: "Other",
      required: false,
    },
  ],
} as FormSetup;
