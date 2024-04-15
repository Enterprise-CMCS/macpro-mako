import {
  AttachmentRecipe,
  zAdditionalInfo,
  zAttachmentOptional,
  zAttachmentRequired,
} from "@/utils";
import { z } from "zod";
import { FormContentHydrator } from "@/features/package-actions/lib/contentSwitch";
import { ReactElement } from "react";
import {
  ActionDescription,
  AdditionalInfoSection,
  AttachmentsSection,
} from "@/components";
import { PackageSection } from "@/features/package-actions/shared-components";
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
export const chipSpaRaiFields: ReactElement[] = [
  <ActionDescription key={"content-description"}>
    Once you submit this form, a confirmation email is sent to you and to CMS.
    CMS will use this content to review your package, and you will not be able
    to edit this form. If CMS needs any additional information, they will follow
    up by email.
    <strong className="bold">
      If you leave this page, you will lose your progress on this form.
    </strong>
  </ActionDescription>,
  <PackageSection key={"content-packagedetails"} />,
  <AttachmentsSection
    key={"field-attachments"}
    attachments={[
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
    ]}
    faqLink={""}
  />,
  <AdditionalInfoSection
    key={"field-addlinfo"}
    instruction={"Add anything else that you would like to share with CMS."}
  />,
];
export const medSpaRaiSchema = z.object({
  additionalInformation: zAdditionalInfo.optional(),
  attachments: z.object({
    raiResponseLetter: zAttachmentRequired({ min: 1 }),
    other: zAttachmentOptional,
  }),
});
export const medSpaRaiFields: ReactElement[] = [
  <ActionDescription key={"content-description"}>
    Once you submit this form, a confirmation email is sent to you and to CMS.
    CMS will use this content to review your package, and you will not be able
    to edit this form. If CMS needs any additional information, they will follow
    up by email.
    <strong className="bold">
      If you leave this page, you will lose your progress on this form.
    </strong>
  </ActionDescription>,
  <PackageSection key={"content-packagedetails"} />,
  <AttachmentsSection
    key={"field-attachments"}
    attachments={[
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
    ]}
    faqLink={""}
  />,
  <AdditionalInfoSection
    key={"field-addlinfo"}
    instruction={"Add anything else that you would like to share with CMS."}
  />,
];
export const spaRaiContent: FormContentHydrator = (document) => ({
  title: `${document.authority} Formal RAI Response Details`,
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
export const bWaiverRaiFields: ReactElement[] = [
  <ActionDescription key={"content-description"}>
    Once you submit this form, a confirmation email is sent to you and to CMS.
    CMS will use this content to review your package, and you will not be able
    to edit this form. If CMS needs any additional information, they will follow
    up by email.
    <strong className="bold">
      If you leave this page, you will lose your progress on this form.
    </strong>
  </ActionDescription>,
  <PackageSection key={"content-packagedetails"} />,
  <AttachmentsSection
    key={"field-attachments"}
    attachments={[
      {
        name: "raiResponseLetter",
        required: true,
        label: "Waiver RAI Response",
      },
      { label: "Other", required: false, name: "other" },
    ]}
    faqLink={""}
  />,
  <AdditionalInfoSection
    key={"field-addlinfo"}
    instruction={
      "Add anything else that you would like to share with the State."
    }
  />,
];
export const waiverRaiContent: FormContentHydrator = (document) => ({
  title: `${document.authority} Waiver Formal RAI Response Details`,
  preSubmitNotice:
    "Once you submit this form, a confirmation email is sent to you and to CMS. CMS will use this content to review your package, and you will not be able to edit this form. If CMS needs any additional information, they will follow up by email.",
  successBanner: {
    header: "RAI response submitted",
    body: `The RAI response for ${document.id} has been submitted.`,
  },
});
