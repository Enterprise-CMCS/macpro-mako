import {
  AttachmentRecipe,
  zAdditionalInfo,
  zAttachmentOptional,
  zAttachmentRequired,
} from "@/utils";
import { z } from "zod";
import { FormContentHydrator } from "@/features/package-actions/lib/contentSwitch";
export const chipSpaRaiSchema = z.object({
  additionalInformation: zAdditionalInfo.optional(),
  attachments: z.object({
    revisedAmendedStatePlanLanguage: zAttachmentRequired({ min: 1 }),
    officialRaiResponse: zAttachmentRequired({ min: 1 }),
    budgetDocuments: zAttachmentOptional,
    publicNotice: zAttachmentOptional,
    tribalConsultation: zAttachmentOptional,
    other: zAttachmentOptional,
  }),
});
export const chipSpaRaiAttachments: AttachmentRecipe<
  z.infer<typeof chipSpaRaiSchema>
>[] = [
  {
    name: "revisedAmendedStatePlanLanguage",
    label: "Revised Amended State Plan Language",
    required: true,
  },
  {
    name: "officialRaiResponse",
    label: "Official RAI Response",
    required: true,
  },
  {
    name: "budgetDocuments",
    label: "Budget Documents",
    required: false,
  },
  {
    name: "publicNotice",
    label: "Public Notice",
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
];

export const medSpaRaiSchema = z.object({
  additionalInformation: zAdditionalInfo.optional(),
  attachments: z.object({
    raiResponseLetter: zAttachmentRequired({ min: 1 }),
    other: zAttachmentOptional,
  }),
});
export const medSpaRaiAttachments: AttachmentRecipe<
  z.infer<typeof medSpaRaiSchema>
>[] = [
  {
    name: "raiResponseLetter",
    label: "RAI Response Letter",
    required: true,
  },
  {
    name: "other",
    label: "Other",
    required: false,
  },
];

export const spaRaiContent: FormContentHydrator = (document) => ({
  title: `${document.authority} Formal RAI Response Details`,
  description: (
    <>
      Once you submit this form, a confirmation email is sent to you and to CMS.
      CMS will use this content to review your package, and you will not be able
      to edit this form. If CMS needs any additional information, they will
      follow up by email.
      <strong className="bold">
        If you leave this page, you will lose your progress on this form.
      </strong>
    </>
  ),
  additionalInfoInstruction:
    "Add anything else that you would like to share with CMS.",
  preSubmitNotice:
    "Once you submit this form, a confirmation email is sent to you and to CMS. CMS will use this content to review your package, and you will not be able to edit this form. If CMS needs any additional information, they will follow up by email.",
  successBanner: {
    header: "RAI response submitted",
    body: `The RAI response for ${document.id} has been submitted.`,
  },
});

export const bWaiverRaiSchema = z.object({
  additionalInformation: z.string().optional().default(""),
  attachments: z.object({
    raiResponseLetter: zAttachmentRequired({ min: 1 }),
    other: zAttachmentOptional,
  }),
});
export const bWaiverRaiAttachments: AttachmentRecipe<
  z.infer<typeof bWaiverRaiSchema>
>[] = [
  {
    name: "raiResponseLetter",
    required: true,
    label: "Waiver RAI Response",
  },
  { label: "Other", required: false, name: "other" },
];

export const waiverRaiContent: FormContentHydrator = (document) => ({
  title: `${document.authority} Waiver Formal RAI Response Details`,
  description: (
    <>
      Once you submit this form, a confirmation email is sent to you and to CMS.
      CMS will use this content to review your package, and you will not be able
      to edit this form. If CMS needs any additional information, they will
      follow up by email.
      <strong className="bold">
        If you leave this page, you will lose your progress on this form.
      </strong>
    </>
  ),
  additionalInfoInstruction:
    "Add anything else that you would like to share with the State.",
  preSubmitNotice:
    "Once you submit this form, a confirmation email is sent to you and to CMS. CMS will use this content to review your package, and you will not be able to edit this form. If CMS needs any additional information, they will follow up by email.",
  successBanner: {
    header: "RAI response submitted",
    body: `The RAI response for ${document.id} has been submitted.`,
  },
});
