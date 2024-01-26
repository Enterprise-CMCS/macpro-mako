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
        bCapCostSpreadsheets: zAttachmentRequired({ min: 1 }),
        bCapIndependentAssessment: zAttachmentOptional,
        tribalConsultation: zAttachmentOptional,
        other: zAttachmentOptional,
      }),
      additionalInformation: zAdditionalInfo,
    })
    .superRefine((data, ctx) => {
      const renewalIteration = data.id.split(".")[1]; // R## segment of Waiver Number
      if (
        ["R00", "R01"].includes(renewalIteration) &&
        data.attachments.bCapIndependentAssessment === undefined
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
      name: "bCapWaiverApplication",
      label: "1915(b) Comprehensive (Capitated) Waiver Application Pre-print",
      required: true,
    },
    {
      name: "bCapCostSpreadsheets",
      label:
        "1915(b) Comprehensive (Capitated) Waiver Cost Effectiveness Spreadsheets",
      required: true,
    },
    {
      name: "bCapIndependentAssessment",
      label: "1915(b) Comprehensive (Capitated) Waiver Independent Assessment",
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
