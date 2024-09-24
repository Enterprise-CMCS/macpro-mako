import { z } from "zod";
import { zAdditionalInfo, zAttachmentOptional } from "@/utils";
import { FormContentHydrator } from "@/features/package-actions/lib/contentSwitch";
import { ReactElement } from "react";
import {
  ActionFormDescription,
  AdditionalInfoSection,
  AttachmentsSection,
} from "@/components";
import { CheckDocumentFunction } from "@/utils/Poller/documentPoller";
import { SEATOOL_STATUS } from "shared-types";

export const defaultWithdrawRaiSchema = z.object({
  additionalInformation: zAdditionalInfo,
  attachments: z.object({
    supportingDocumentation: zAttachmentOptional,
  }),
});
export const defaultWithdrawRaiFields: ReactElement[] = [
  <ActionFormDescription key="content-description" boldReminder>
    Complete this form to withdraw the Formal RAI response. Once complete, you
    and CMS will receive an email confirmation.
  </ActionFormDescription>,
  <AttachmentsSection
    faqAttLink="/faq"
    key={"field-attachments"}
    attachments={[
      {
        name: "supportingDocumentation",
        required: false,
      },
    ]}
  />,
  <AdditionalInfoSection
    required
    key={"field-addlinfo"}
    instruction={"Explain your need for withdrawal."}
  />,
];
export const defaultWithdrawRaiContent: FormContentHydrator = (document) => {
  // TODO:  Uncomment when appks are supported
  // const title = document.appkParent
  //   ? `${document.authority} Appendix K Withdraw Formal RAI Response Details`
  //   : `${document.authority} Withdraw Formal RAI Response Details`;
  const title = `${document.authority} Withdraw Formal RAI Response Details`;
  return {
    title,
    preSubmitNotice:
      "Once complete, you and CMS will receive an email confirmation.",
    confirmationModal: {
      header: "Withdraw RAI response?",
      body: `The RAI response for ${document.id} will be withdrawn, and CMS will be notified.`,
      acceptButtonText: "Yes, withdraw response",
      cancelButtonText: "Cancel",
    },
    successBanner: {
      header: "RAI response withdrawn",
      body: `The RAI response for ${document.id} has been withdrawn. CMS may follow up if additional information is needed.`,
    },
  };
};

export const raiWithdrawn: CheckDocumentFunction = (checks) =>
  checks.hasStatus(SEATOOL_STATUS.PENDING_RAI) && checks.hasRaiWithdrawal;
