import { z } from "zod";
import { zAdditionalInfo, zAttachmentRequired } from "@/utils";
import { FormContentHydrator } from "@/features/package-actions/lib/contentSwitch";
import { ReactElement } from "react";
import {
  ActionFormDescription,
  AdditionalInfoSection,
  AttachmentsSection,
} from "@/components";
import { PackageSection } from "@/components/Form/content/PackageSection";

export const chipWithdrawPackageSchema = z.object({
  additionalInformation: zAdditionalInfo.optional(),
  attachments: z.object({
    officialWithdrawalLetter: zAttachmentRequired({ min: 1 }),
  }),
});
export const chipWithdrawPackageFields: ReactElement[] = [
  <ActionFormDescription key={"content-description"}>
    Complete this form to withdraw a package. Once complete, you will not be
    able to resubmit this package. CMS will be notified and will use this
    content to review your request. If CMS needs any additional information,
    they will follow up by email.
  </ActionFormDescription>,
  <PackageSection key={"content-packagedetails"} />,
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
export const chipWithdrawPackageContent: FormContentHydrator = (document) => ({
  title: "Withdraw CHIP SPA",
  preSubmitNotice:
    "Once complete, you will not be able to resubmit this package. CMS will be notified and will use this content to review your request. If CMS needs any additional information, they will follow up by email.",
  confirmationModal: {
    header: "Withdraw Package?",
    body: `You are about to withdraw ${document.authority} ${document.id}. Completing this action will conclude the review of this ${document.authority} package. If you are not sure this is the correct action to select, contact your CMS point of contact for assistance`,
    acceptButtonText: "Yes, withdraw package",
    cancelButtonText: "Return to form",
  },
  successBanner: {
    header: "Package withdrawn",
    body: `The package ${document.id} has been withdrawn.`,
  },
});
