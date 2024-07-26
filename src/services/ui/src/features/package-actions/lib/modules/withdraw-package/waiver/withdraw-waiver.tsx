import {
  ActionFormDescription,
  AdditionalInfoSection,
  AttachmentsSection,
} from "@/components";
import { FormContentHydrator } from "@/features/package-actions/lib/contentSwitch";
import { defaultWithdrawPackageContent } from "@/features/package-actions/lib/modules";
import { ReactElement } from "react";
import { opensearch } from "shared-types";

const mapActionType: Record<string, string> = {
  New: "initial",
  Renew: "renewal",
  Amend: "amendment",
};
const confirmationModalBody = (document: opensearch.main.Document) => {
  const beginning = `You are about to withdraw ${document.authority} ${mapActionType[document.actionType]} waiver ${document.id}.`;
  const middle = document.appkParent
    ? `Completing this action will conclude
    the review of this ${document.authority} ${mapActionType[document.actionType]} waiver package, and all packages associated with ${document.id} will also be withdrawn.`
    : `Completing this action will conclude 
    the review of this ${document.authority} ${mapActionType[document.actionType]} waiver package.`;
  const end =
    "If you are not sure this is the correct action to select, contact your CMS point of contact for assistance.";
  return `${beginning} ${middle} ${end}`;
};

export const waiverWithdraw1915cPackageFields: ReactElement[] = [
  <ActionFormDescription key="content-description" boldReminder>
    Complete this form to withdraw this 1915(c) Appendix K package. Once
    complete, you will not be able to resubmit this package. CMS will be
    notified and will use this content to review your request. If CMS needs any
    additional information, they will follow up by email.
  </ActionFormDescription>,
  <AttachmentsSection
    faqAttLink="/faq"
    key={"field-attachments"}
    instructions={
      "Upload your supporting documentation for withdrawal or explain your need for withdrawal in the Additional Information section."
    }
    attachments={[
      {
        name: "supportingDocumentation",
        required: false,
      },
    ]}
  />,
  <AdditionalInfoSection
    key={"field-addlinfo"}
    instruction={
      "Explain your need for withdrawal, or upload supporting documentation."
    }
  />,
];

export const waiverWithdrawPackageContent: FormContentHydrator = (
  document,
) => ({
  ...defaultWithdrawPackageContent(document),
  confirmationModal: {
    ...defaultWithdrawPackageContent(document).confirmationModal!,
    // The AppK condition got messy, so I broke the string templating logic out
    body: confirmationModalBody(document),
  },
});
