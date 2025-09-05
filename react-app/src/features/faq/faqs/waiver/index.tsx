import { Appk } from "./appk";
import { AppkAttachments } from "./appk-attachments";
import { FormalRequestWaiver } from "./formal-request-waiver";
import { InitialWaiverIdFormat } from "./initial-waiver-id-format";
import { TemporaryExtensionsBAttachments } from "./temporary-extensions-b-attachments";
import { TemporaryExtensionsCAttachments } from "./temporary-extensions-c-attachments";
import { WaiverAmendmentIdFormat } from "./waiver-amendment-id-format";
import { WaiverCId } from "./waiver-c-id";
import { WaiverExtensionIdFormat } from "./waiver-extension-id-format";
import { WaiverExtensionStatus } from "./waiver-extension-status";
import { WaiverIdHelp } from "./waiver-id-help";
import { WaiverRenewalIdFormat } from "./waiver-renewal-id-format";
import { WaiverBAttachments } from "./waiverb-attachments";
import { WaiverBRaiAttachments } from "./waiverb-rai-attachments";
import { WithdrawPackageWaiver } from "./withdraw-package-waiver";
import { WithdrawWaiverRaiResponse } from "./withdraw-waiver-rai-response";

export const waiverContent = [
  {
    anchorText: "initial-waiver-id-format",
    question: "What format is used to enter a 1915(b) Initial Waiver number?",
    answerJSX: <InitialWaiverIdFormat />,
  },
  {
    anchorText: "waiver-renewal-id-format",
    question: "What format is used to enter a 1915(b) Waiver Renewal number?",
    answerJSX: <WaiverRenewalIdFormat />,
  },
  {
    anchorText: "waiver-amendment-id-format",
    question: "What format is used to enter a 1915(b) Waiver Amendment number?",
    answerJSX: <WaiverAmendmentIdFormat />,
  },
  {
    anchorText: "waiver-id-help",
    question: "Who can I contact to help me figure out the correct 1915(b) Waiver Number?",
    answerJSX: <WaiverIdHelp />,
  },
  {
    anchorText: "waiver-c-id",
    question: "What format is used to enter a 1915(c) waiver number?",
    answerJSX: <WaiverCId />,
  },
  {
    anchorText: "waiverb-attachments",
    question: "What attachments are needed to submit a 1915(b) waiver action?",
    answerJSX: <WaiverBAttachments />,
  },
  {
    anchorText: "waiverb-rai-attachments",
    question:
      "What are the attachments for a 1915(b) Waiver and 1915(c) Appendix K response to Request for Additional Information (RAI)?",
    answerJSX: <WaiverBRaiAttachments />,
  },
  {
    anchorText: "waiver-extension-id-format",
    question: "What format is used to enter a 1915(b) or 1915(c) Temporary Extension number?",
    answerJSX: <WaiverExtensionIdFormat />,
  },
  {
    anchorText: "waiver-extension-status",
    question:
      "Why does the status of my Temporary Extension Request continue to show as 'Submitted'?",
    answerJSX: <WaiverExtensionStatus />,
  },
  {
    anchorText: "temporary-extensions-b-attachments",
    question: "What are the attachments for a 1915(b) Waiver - Request for Temporary Extension?",
    answerJSX: <TemporaryExtensionsBAttachments />,
  },
  {
    anchorText: "temporary-extensions-c-attachments",
    question: "What are the attachments for a 1915(c) Waiver - Request for Temporary Extension?",
    answerJSX: <TemporaryExtensionsCAttachments />,
  },
  {
    anchorText: "appk",
    question: "Can I submit Appendix K amendments in OneMAC?",
    answerJSX: <Appk />,
  },
  {
    anchorText: "appk-attachments",
    question: "What are the attachments for a 1915(c) Appendix K Waiver?",
    answerJSX: <AppkAttachments />,
  },
  {
    anchorText: "formal-request-waiver",
    question:
      "How do I submit a Formal Request for Additional Information (RAI) Response for a Waiver?",
    answerJSX: <FormalRequestWaiver />,
  },
  {
    anchorText: "withdraw-waiver-rai-response",
    question: "How do I Withdraw a Formal RAI Response for a Medicaid Waiver?",
    answerJSX: <WithdrawWaiverRaiResponse />,
  },
  {
    anchorText: "withdraw-package-waiver",
    question: "How do I Withdraw a Package for a Waiver?",
    answerJSX: <WithdrawPackageWaiver />,
  },
];
