import { z } from "zod";
import {
  zAdditionalInfo,
  zAttachmentOptional,
  zAttachmentRequired,
  zRenewalWaiverNumberSchema,
} from "@/pages/form/zod";
import { FormSetup } from "@/lib";

export default {
  schema: z
    .object({
      id: zRenewalWaiverNumberSchema,
      proposedEffectiveDate: z.date(),
      attachments: z.object({
        b4WaiverApplication: zAttachmentRequired({ min: 1 }),
        b4IndependentAssessment: zAttachmentOptional,
        tribalConsultation: zAttachmentOptional,
        other: zAttachmentOptional,
      }),
      additionalInformation: zAdditionalInfo,
    })
    .superRefine((data, ctx) => {
      const renewalIteration = data.id.split(".")[1]; // R## segment of Waiver Number
      if (
        ["R00", "R01"].includes(renewalIteration) &&
        data.attachments.b4IndependentAssessment === undefined
      ) {
        ctx.addIssue({
          message:
            "An Independent Assessment is required for the first two renewals.",
          code: z.ZodIssueCode.custom,
          fatal: true,
        });
      }
      return z.NEVER;
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
      subtext: "Required for the first two renewals",
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
