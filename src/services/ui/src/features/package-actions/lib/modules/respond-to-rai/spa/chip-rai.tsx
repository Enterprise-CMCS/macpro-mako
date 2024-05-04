import { z } from "zod";
import {
  zAdditionalInfo,
  zAttachmentOptional,
  zAttachmentRequired,
} from "@/utils";
import { ReactElement } from "react";
import {
  ActionFormDescription,
  AdditionalInfoSection,
  AttachmentsSection,
} from "@/components";
import { PackageSection } from "@/components/Form/content/PackageSection";

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
  <ActionFormDescription key={"content-description"}>
    Once you submit this form, a confirmation email is sent to you and to CMS.
    CMS will use this content to review your package, and you will not be able
    to edit this form. If CMS needs any additional information, they will follow
    up by email.
    <strong className="bold">
      If you leave this page, you will lose your progress on this form.
    </strong>
  </ActionFormDescription>,
  <PackageSection key={"content-packagedetails"} />,
  <AttachmentsSection
    key={"field-attachments"}
    attachments={[
      {
        name: "revisedAmendedStatePlanLanguage",
        required: true,
      },
      {
        name: "officialRaiResponse",
        required: true,
      },
      {
        name: "budgetDocuments",
        required: false,
      },
      {
        name: "publicNotice",
        required: false,
      },
      {
        name: "tribalConsultation",
        required: false,
      },
      {
        name: "other",
        required: false,
      },
    ]}
    faqAttLink="/faq/chip-spa-rai-attachments"
  />,
  <AdditionalInfoSection
    key={"field-addlinfo"}
    instruction={"Add anything else that you would like to share with CMS."}
  />,
];
