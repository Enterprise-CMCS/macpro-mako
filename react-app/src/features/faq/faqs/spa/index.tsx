import { AbpImplementationGuidesSpa } from "./abp-implementation-guides-spa";
import { AbpSpaTemplates } from "./abp-spa-templates";
import { ChipSpaAttachments } from "./chip-spa-attachments";
import { ChipSpaImplementationGuides } from "./chip-spa-implementation-guides";
import { ChipSpaRaiAttachments } from "./chip-spa-rai-attachments";
import { ChipSpaTemplates } from "./chip-spa-templates";
import { FormalRequestChipSpa } from "./formal-request-chip-spa";
import { FormalRequestMedicaidSpa } from "./formal-request-medicaid-spa";
import { MedicaidSpaAttachments } from "./medicaid-spa-attachments";
import { MedicaidSpaRaiAttachments } from "./medicaid-spa-rai-attachments";
import { MpcSpaImplementationGuides } from "./mpc-spa-implementation-guides";
import { MpcSpaTemplates } from "./mpc-spa-templates";
import { PublicHealthEmergency } from "./public-health-emergency";
import { SpaAmendments } from "./spa-amendments";
import { SpaIdFormat } from "./spa-id-format";
import { WithdrawChipSpaRaiResponse } from "./withdraw-chip-spa-rai-response";
import { WithdrawPackageChipSpa } from "./withdraw-package-chip-spa";
import { WithdrawPackageSpa } from "./withdraw-package-spa";
import { WithdrawSpaRaiResponse } from "./withdraw-spa-rai-response";

export const spaContent = [
  {
    anchorText: "spa-amendments",
    question: "Which state plan amendments (SPAs) can I submit in OneMAC?",
    label: "Updated", // Add a `label` field for LD faq
    labelColor: "green",
    answerJSX: <SpaAmendments />,
  },
  {
    anchorText: "spa-id-format",
    question: "What format is used to enter a SPA ID?",
    answerJSX: <SpaIdFormat />,
  },
  {
    anchorText: "medicaid-spa-attachments",
    question: "What are the attachments for a Medicaid SPA?",
    answerJSX: <MedicaidSpaAttachments />,
  },
  {
    anchorText: "medicaid-spa-rai-attachments",
    question:
      "What are the attachments for a Medicaid response to Request for Additional Information (RAI)?",
    answerJSX: <MedicaidSpaRaiAttachments />,
  },
  {
    anchorText: "chip-spa-attachments",
    question: "What are the attachments for a CHIP SPA?",
    label: "Updated", // Add a `label` field for LD faq
    labelColor: "green",
    answerJSX: <ChipSpaAttachments />,
  },
  {
    anchorText: "chip-spa-rai-attachments",
    question:
      "What are the attachments for a CHIP SPA response to Request for Additional Information (RAI)?",
    answerJSX: <ChipSpaRaiAttachments />,
  },
  {
    anchorText: "public-health-emergency",
    question: "Can I submit SPAs relating to the Public Health Emergency (PHE) in OneMAC?",
    answerJSX: <PublicHealthEmergency />,
  },
  {
    anchorText: "formal-request-medicaid-spa",
    question:
      "How do I submit a Formal Request for Additional Information (RAI) Response for a Medicaid SPA?",
    answerJSX: <FormalRequestMedicaidSpa />,
  },
  {
    anchorText: "withdraw-spa-rai-response",
    question: "How do I Withdraw a Formal RAI Response for a Medicaid SPA?",
    answerJSX: <WithdrawSpaRaiResponse />,
  },
  {
    anchorText: "withdraw-package-spa",
    question: "How do I Withdraw a Package for a Medicaid SPA?",
    answerJSX: <WithdrawPackageSpa />,
  },
  {
    anchorText: "formal-request-chip-spa",
    question:
      "How do I submit a Formal Request for Additional Information (RAI) Response for a CHIP SPA?",
    answerJSX: <FormalRequestChipSpa />,
  },
  {
    anchorText: "withdraw-chip-spa-rai-response",
    question: "How do I Withdraw a Formal RAI Response for a CHIP SPA?",
    answerJSX: <WithdrawChipSpaRaiResponse />,
  },
  {
    anchorText: "withdraw-package-chip-spa",
    question: "How do I Withdraw a Package for a CHIP SPA?",
    answerJSX: <WithdrawPackageChipSpa />,
  },
  {
    anchorText: "abp-spa-templates",
    question: "Where can I download Medicaid Alternative Benefit Plan (ABP) SPA templates?",
    label: "Updated",
    labelColor: "green",
    answerJSX: <AbpSpaTemplates />,
  },
  {
    anchorText: "abp-implementation-guides-spa",
    question:
      "Where can I download Medicaid Alternative Benefit Plan (ABP) SPA implementation guides?",
    label: "New",
    labelColor: "blue",
    answerJSX: <AbpImplementationGuidesSpa />,
  },
  {
    anchorText: "mpc-spa-templates",
    question: "Where can I download Medicaid Premiums and Cost Sharing SPA templates?",
    label: "New",
    labelColor: "blue",
    answerJSX: <MpcSpaTemplates />,
  },
  {
    anchorText: "mpc-spa-implementation-guides",
    question: "Where can I download Medicaid Premiums and Cost Sharing SPA implementation guides?",
    label: "New",
    labelColor: "blue",
    answerJSX: <MpcSpaImplementationGuides />,
  },
  {
    anchorText: "chip-spa-templates",
    question: "Where can I download CHIP eligibility SPA templates?",
    label: "Updated",
    labelColor: "green",
    answerJSX: <ChipSpaTemplates />,
  },
  {
    anchorText: "chip-spa-implementation-guides",
    question: "Where can I download CHIP eligibility SPA implementation guides?",
    label: "Updated",
    labelColor: "green",
    answerJSX: <ChipSpaImplementationGuides />,
  },
];
