import { attachments } from "./attachments";
const capitatedAmendmentBase = {
  id: "VA-1234.R11.01",
  event: "capitated-amendment",
  authority: "1915(c)",
  proposedEffectiveDate: 1700000000,
  title: "Sample Title for Appendix K",
  attachments: {
    ...attachments.bCapWaiverApplication,
    ...attachments.bCapCostSpreadsheets,
    ...attachments.tribalConsultation,
    ...attachments.other,
  },
  additionalInformation: "Some additional information about this submission.",
  waiverNumber: "VA-1111.R11.11",
};
const appkBase = {
  id: "VA-1234.R11.01",
  event: "app-k",
  authority: "1915(c)",
  proposedEffectiveDate: 1700000000,
  title: "Sample Title for Appendix K",
  attachments: {
    ...attachments.appk,
    ...attachments.other,
  },
  additionalInformation: "Some additional information about this submission.",
};
const capitatedInitial = {
  id: "VA-1234.R00.00",
  event: "capitated-initial",
  authority: "1915(c)",
  proposedEffectiveDate: 1700000000,
  title: "Sample Title for Appendix K",
  attachments: {
    ...attachments.bCapWaiverApplication,
    ...attachments.bCapCostSpreadsheets,
    ...attachments.tribalConsultation,
    ...attachments.other,
  },
  additionalInformation: "Some additional information about this submission.",
  waiverNumber: "VA-1111.R11.11",
};
const capitatedRenewal = {
  id: "VA-1234.R01.00",
  event: "capitated-renewal",
  authority: "1915(c)",
  proposedEffectiveDate: 1700000000,
  title: "Sample Title for Appendix K",
  attachments: {
    ...attachments.bCapIndependentAssessment,
    ...attachments.bCapWaiverApplication,
    ...attachments.bCapCostSpreadsheets,
    ...attachments.tribalConsultation,
    ...attachments.other,
  },
  additionalInformation: "Some additional information about this submission.",
  waiverNumber: "VA-1111.R11.11",
};
const contractingAmendment = {
  id: "VA-1234.R11.01",
  event: "contracting-amendment",
  authority: "1915(b)",
  proposedEffectiveDate: 1700000000,
  title: "Sample Title for Appendix K",
  attachments: {
    ...attachments.b4Waiver,
    ...attachments.tribalConsultation,
    ...attachments.other,
  },
  additionalInformation: "Some additional information about this submission.",
  waiverNumber: "VA-1111.R11.11",
};
const contractingInitial = {
  id: "VA-1234.R00.00",
  event: "contracting-initial",
  authority: "1915(b)",
  proposedEffectiveDate: 1700000000,
  title: "Sample Title for Appendix K",
  attachments: {
    ...attachments.b4Waiver,
    ...attachments.tribalConsultation,
    ...attachments.other,
  },
  additionalInformation: "Some additional information about this submission.",
  waiverNumber: "VA-1111.R11.11",
};
const contractingRenewal = {
  id: "VA-1234.R01.00",
  event: "contracting-renewal",
  authority: "1915(b)",
  proposedEffectiveDate: 1700000000,
  title: "Sample Title for Appendix K",
  attachments: {
    ...attachments.b4IndependentAssessment,
    ...attachments.b4Waiver,
    ...attachments.tribalConsultation,
    ...attachments.other,
  },
  additionalInformation: "Some additional information about this submission.",
  waiverNumber: "VA-1111.R01.00",
};
const newChipSubmission = {
  id: "VA-11-2021",
  event: "new-chip-submission",
  authority: "1915(b)",
  proposedEffectiveDate: 1700000000,
  title: "Sample Title for Appendix K",
  attachments: {
    ...attachments.currentStatePlan,
    ...attachments.amendedLanguage,
    ...attachments.coverLetter,
    ...attachments.budgetDocuments,
    ...attachments.publicNotice,
    ...attachments.tribalConsultation,
    ...attachments.other,
  },
  additionalInformation: "Some additional information about this submission.",
  waiverNumber: "VA-1111.R11.11",
};
const newMedicaidSubmission = {
  id: "VA-11-2021",
  event: "new-medicaid-submission",
  authority: "1915(b)",
  proposedEffectiveDate: 1700000000,
  title: "Sample Title for Appendix K",
  attachments: {
    ...attachments.cmsForm,
    ...attachments.spaPages,
    ...attachments.coverLetter,
    ...attachments.tribalEngagement,
    ...attachments.existingStatePlanPages,
    ...attachments.publicNotice,
    ...attachments.sfq,
    ...attachments.tribalConsultation,
    ...attachments.other,
  },
  additionalInformation: "Some additional information about this submission.",
  waiverNumber: "VA-1111.R11.11",
};
const respondToRai = {
  id: "VA-11-2020",
  event: "respond-to-rai",
  authority: "1915(b)",
  proposedEffectiveDate: 1700000000,
  title: "Sample Title for Appendix K",
  attachments: {
    ...attachments.raiResponseLetter,
    ...attachments.other,
  },
  additionalInformation: "Some additional information about this submission.",
  waiverNumber: "VA-1111.R11.11",
};
const temporaryExtension = {
  id: "VA-1234.R11.TE12",
  event: "temporary-extension",
  authority: "1915(b)",
  proposedEffectiveDate: 1700000000,
  title: "Sample Title for Appendix K",
  attachments: {
    ...attachments.waiverExtensionRequest,
    ...attachments.other,
  },
  additionalInformation: "Some additional information about this submission.",
  waiverNumber: "VA-1111.R11.00",
};
const toggleWithdrawRai = {
  id: "VA-11-2020",
  event: "toggle-withdraw-rai",
  authority: "1915(b)",
  raiWithdrawEnabled: true,
  proposedEffectiveDate: 1700000000,
};
const withdrawPackage = {
  id: "VA-11-2020",
  event: "withdraw-package",
  authority: "1915(b)",
  proposedEffectiveDate: 1700000000,
  title: "Sample Title for Appendix K",
  attachments: {
    ...attachments.supportingDocumentation,
  },
  additionalInformation: "Some additional information about this submission.",
  waiverNumber: "VA-1111.R11.00",
};
const withdrawRai = {
  id: "VA-11-2020",
  event: "withdraw-rai",
  authority: "1915(b)",
  proposedEffectiveDate: 1700000000,
  title: "Sample Title for Appendix K",
  attachments: {
    ...attachments.supportingDocumentation,
  },
  additionalInformation: "Some additional information about this submission.",
  waiverNumber: "VA-1111.R11.00",
};
const uploadSubsequentDocuments = {
  id: "VA-1111.R11.00",
  event: "upload-subsequent-documents",
  authority: "1915(b)",
  proposedEffectiveDate: 1700000000,
  title: "Sample Title for Appendix K",
  attachments: {},
  additionalInformation: "Some additional information about this submission.",
  waiverNumber: "VA-1111.R11.00",
};

export const eventsAttachmentRequired = [
  appkBase,
  capitatedAmendmentBase,
  capitatedInitial,
  capitatedRenewal,
  withdrawPackage,
  temporaryExtension,
  respondToRai,
  newMedicaidSubmission,
  newChipSubmission,
  contractingRenewal,
  contractingInitial,
  contractingAmendment,
  withdrawRai,
];

export const eventsAuthorizationRequired = [...eventsAttachmentRequired, toggleWithdrawRai];

export const events = [...eventsAuthorizationRequired, uploadSubsequentDocuments];
