import { attachments } from "./attachments";
export const capitatedAmendmentBase = {
  id: "SS-1234.R11.01",
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
  waiverNumber: "SS-1111.R11.11",
};
export const appkBase = {
  id: "SS-1234.R11.01",
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
export const capitatedInitial = {
  id: "SS-1234.R00.00",
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
  waiverNumber: "SS-1111.R11.11",
};

export const contractingAmmendment = {
  id: "SS-1234.R11.01",
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
  waiverNumber: "SS-1111.R11.11",
};
export const contractingInitial = {
  id: "SS-1234.R11.01",
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
  waiverNumber: "SS-1111.R11.11",
};
export const contractingRenewal = {
  id: "SS-1234.R11.01",
  event: "contracting-amendment",
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
  waiverNumber: "SS-1111.R11.11",
};
export const newChipSubmission = {
  id: "SS-11-2021",
  event: "new-chip-submission",
  authority: "1915(b)",
  proposedEffectiveDate: 1700000000,
  title: "Sample Title for Appendix K",
  attachments: {
    ...attachments.currentStatePlan,
    ...attachments.ammendedLanguage,
    ...attachments.coverLetter,
    ...attachments.budgetDocuments,
    ...attachments.publicNotice,
    ...attachments.tribalConsultation,
    ...attachments.other,
  },
  additionalInformation: "Some additional information about this submission.",
  waiverNumber: "SS-1111.R11.11",
};
export const newMedicaidSubmission = {
  id: "SS-11-2021",
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
  waiverNumber: "SS-1111.R11.11",
};
export const respondToRai = {
  id: "SS-11-2020",
  event: "respond-to-rai",
  authority: "1915(b)",
  proposedEffectiveDate: 1700000000,
  title: "Sample Title for Appendix K",
  attachments: {
    ...attachments.raiResponseLetter,
    ...attachments.other,
  },
  additionalInformation: "Some additional information about this submission.",
  waiverNumber: "SS-1111.R11.11",
};
export const temporaryExtension = {
  id: "SS-1234.R11.TE12",
  event: "temporary-extension",
  authority: "1915(b)",
  proposedEffectiveDate: 1700000000,
  title: "Sample Title for Appendix K",
  attachments: {
    ...attachments.waiverExtensionRequest,
    ...attachments.other,
  },
  additionalInformation: "Some additional information about this submission.",
  waiverNumber: "SS-1111.R11.00",
};
export const toggleWithdrawRai = {
  id: "SS-11-2020",
  event: "toggle-withdraw-rai",
  authority: "1915(b)",
  raiWithdrawEnabled: true,
  proposedEffectiveDate: 1700000000,
};
export const withdrawPackage = {
  id: "SS-11-2020",
  event: "withdraw-package",
  authority: "1915(b)",
  proposedEffectiveDate: 1700000000,
  title: "Sample Title for Appendix K",
  attachments: {
    ...attachments.supportingDocumentation,
  },
  additionalInformation: "Some additional information about this submission.",
  waiverNumber: "SS-1111.R11.00",
};
export const withdrawRai = {
  id: "SS-11-2020",
  event: "withdraw-rai",
  authority: "1915(b)",
  proposedEffectiveDate: 1700000000,
  title: "Sample Title for Appendix K",
  attachments: {
    ...attachments.supportingDocumentation,
  },
  additionalInformation: "Some additional information about this submission.",
  waiverNumber: "SS-1111.R11.00",
};
