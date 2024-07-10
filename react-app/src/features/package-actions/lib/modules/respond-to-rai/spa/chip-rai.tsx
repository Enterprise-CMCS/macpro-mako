import { z } from "zod";
import {
  zAdditionalInfoOptional,
  zAttachmentOptional,
  zAttachmentRequired,
} from "@/utils";
import { ReactElement } from "react";
import {
  ActionFormDescription,
  AdditionalInfoSection,
  AttachmentsSection,
} from "@/components";

export const chipSpaRaiSchema = z.object({
  additionalInformation: zAdditionalInfoOptional,
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
  <ActionFormDescription boldReminder key="content-description">
    Once you submit this form, a confirmation email is sent to you and to CMS.
    CMS will use this content to review your package, and you will not be able
    to edit this form. If CMS needs any additional information, they will follow
    up by email.
  </ActionFormDescription>,
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
