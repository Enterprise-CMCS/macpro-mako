export const emailTemplateValue = {
  id: "MD-1234.R00.00",
  territory: "MD",
  applicationEndpointUrl: "https://mako-dev.cms.gov",
  timestamp: Date.now(),
  submitterName: "George Harrison",
  submitterEmail: "george@example.com",
  origin: "mako" as const,
  actionType: "Withdraw",
  additionalInformation:
    "This someadditional information, i like the costco granola bars, like... a lot. I eat maybe 12 a day, thats 1200 calories i could probably do without, but at least im getting my daily dose of fiber.",
  attachments: {
    cmsForm179: {
      files: [
        {
          filename: "test.pdf",
          title: "test",
          bucket: "mako-outbox-attachments-635052997545",
          key: "b545ea14-6b1b-47c0-a374-743fcba4391f.pdf",
          uploadDate: Date.now(),
        },
      ],
      label: "CMS Form 179",
    },
    spaPages: {
      files: [
        {
          filename: "test.pdf",
          title: "test",
          bucket: "mako-outbox-attachments-635052997545",
          key: "f581c0ec-cbb2-4875-a384-86c06136f4c4.pdf",
          uploadDate: Date.now(),
        },
      ],
      label: "SPA Pages",
    },
    tribalEngagement: {
      label: "Document Demonstrating Good-Faith Tribal Engagement",
    },
    existingStatePlanPages: {
      label: "Existing State Plan Page(s)",
    },
    publicNotice: {
      label: "Public Notice",
    },
    coverLetter: {
      label: "Cover Letter",
    },
    sfq: {
      label: "Standard Funding Questions (SFQs)",
    },
    tribalConsultation: {
      label: "Tribal Consultation",
    },
    other: {
      label: "Other",
    },
    bCapWaiverApplication: {
      label: "B-CAP Waiver Application",
      files: [],
    },
    bCapCostSpreadsheets: {
      label: "B-CAP Cost Spreadsheets",
      files: [],
    },
  },
  proposedEffectiveDate: Date.now() + 5 * 24 * 60 * 60,
};
