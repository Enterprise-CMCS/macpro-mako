import { z } from "zod";
import { zAdditionalInfoOptional, zAttachmentRequired } from "@/utils";
import { ReactElement } from "react";
import {
  AdditionalInfoSection,
  AttachmentsSection,
  ActionFormDescription,
} from "@/components";

export const chipWithdrawPackageSchema = z.object({
  additionalInformation: zAdditionalInfoOptional,
  attachments: z.object({
    officialWithdrawalLetter: zAttachmentRequired({ min: 1 }),
  }),
});

export const chipWithdrawPackageFields: ReactElement[] = [
  <ActionFormDescription key="content-description">
    Complete this form to withdraw a package. Once complete, you will not be
    able to resubmit this package. CMS will be notified and will use this
    content to review your request. If CMS needs any additional information,
    they will follow up by email. If you leave this page, you will lose your
    progress on this form.
  </ActionFormDescription>,
  <AttachmentsSection
    faqAttLink="/faq"
    key={"field-attachments"}
    instructions={
      "Official withdrawal letters are required and must be on state letterhead signed by the State Medicaid Director or CHIP Director."
    }
    attachments={[
      {
        name: "officialWithdrawalLetter",
        required: true,
      },
    ]}
  />,
  <AdditionalInfoSection
    key={"field-addlinfo"}
    instruction={"Explain your need for withdrawal."}
  />,
];
