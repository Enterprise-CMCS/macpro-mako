import { z } from "zod";
import {
  zAdditionalInfo,
  zAttachmentOptional,
  zAttachmentRequired,
} from "@/pages/form/zod";
import { FormSetup } from "@/lib";

export default {
  schema: z.object({
    attachments: z.object({
      b4WaiverApplication: zAttachmentRequired({ min: 1 }),
      b4IndependentAssessment: zAttachmentOptional, // TODO: Make required ONLY for first 2 renewals
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
      name: "b4IndependentAssessment",
      label: "FFS Selective Contracting (Streamlined) Independent Assessment",
      // TODO: Visually communicate required ONLY for first 2 renewals...somehow
      required: false,
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
