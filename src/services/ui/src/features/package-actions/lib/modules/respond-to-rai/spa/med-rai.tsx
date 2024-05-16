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
  PackageSection,
} from "@/components";

export const medSpaRaiSchema = z.object({
  additionalInformation: zAdditionalInfoOptional,
  attachments: z.object({
    raiResponseLetter: zAttachmentRequired({ min: 1 }),
    other: zAttachmentOptional,
  }),
});
export const medSpaRaiFields: ReactElement[] = [
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
    faqAttLink="/faq/medicaid-spa-rai-attachments"
    key={"field-attachments"}
    attachments={[
      {
        name: "raiResponseLetter",
        required: true,
      },
      {
        name: "other",
        required: false,
      },
    ]}
  />,
  <AdditionalInfoSection
    key={"field-addlinfo"}
    instruction={"Add anything else that you would like to share with CMS."}
  />,
];
