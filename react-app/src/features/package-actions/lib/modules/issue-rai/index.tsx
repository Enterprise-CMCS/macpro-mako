import { z } from "zod";
import {
  zAdditionalInfo,
  zAttachmentOptional,
  zAttachmentRequired,
} from "@/utils/zod";
import { FormContentHydrator } from "@/features/package-actions/lib/contentSwitch";
import { ReactElement } from "react";
import {
  ActionFormDescription,
  AdditionalInfoSection,
  AttachmentsSection,
} from "@/components";
import { CheckDocumentFunction } from "@/utils/Poller/documentPoller";
import { SEATOOL_STATUS } from "shared-types";

export const defaultIssueRaiSchema = z.object({
  additionalInformation: zAdditionalInfo,
  attachments: z.object({
    formalRaiLetter: zAttachmentRequired({ min: 1 }),
    other: zAttachmentOptional,
  }),
});
export const defaultIssueRaiFields: ReactElement[] = [
  <ActionFormDescription boldReminder key="content-description">
    Issuance of a Formal RAI in OneMAC will create a Formal RAI email sent to
    the State. This will also create a section in the package details summary
    for you and the State to have record. Please attach the Formal RAI Letter
    along with any additional information or comments in the provided text box.
    Once you submit this form, a confirmation email is sent to you and to the
    State.
  </ActionFormDescription>,
  <AttachmentsSection
    key={"field-attachments"}
    attachments={[
      {
        name: "formalRaiLetter",
        required: true,
      },
      {
        name: "other",
        required: false,
      },
    ]}
    faqAttLink={"/faq"}
  />,
  <AdditionalInfoSection
    required
    key={"field-addlinfo"}
    instruction={
      "Add anything else that you would like to share with the State."
    }
  />,
];
export const defaultIssueRaiContent: FormContentHydrator = (document) => ({
  title: "Formal RAI Details",
  preSubmitNotice:
    "Once you submit this form, a confirmation email is sent to you and to the State.",
  successBanner: {
    header: "RAI issued",
    body: `The RAI for ${document.id} has been submitted. An email confirmation will be sent to you and the state.`,
  },
});

export const raiIssued: CheckDocumentFunction = (checks) =>
  checks.hasStatus(SEATOOL_STATUS.PENDING_RAI) && checks.hasLatestRai;
