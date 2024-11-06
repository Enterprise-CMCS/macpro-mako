export const emailTemplateValue = {
  territory: "CO",
  applicationEndpointUrl: "https://mako-dev.cms.gov",
  timestamp: Date.now(),
  submitterName: "George Harrison",
  submitterEmail: "george@example.com",
  additionalInformation:
    "Whoever fights monsters should see to it that in the process he does not become a monster. And if you gaze long enough into an abyss, the abyss will gaze back into you.",
  origin: "mako" as const,
  appkParentId: null,
  attachments: {
    currentStatePlan: {
      files: [
        {
          filename: "state-plan-2024.pdf",
          title: "State Plan 2024",
          bucket: "mako-outbox-attachments-635052997545",
          key: "8d02fabb-9c01-41b4-a75d-e365bbed3d6a.pdf",
          uploadDate: Date.now(),
        },
      ],
      label: "CMS Form 179",
    },
    tribalEngagement: {
      label: "Document Demonstrating Good-Faith Tribal Engagement",
      files: [
        {
          filename: "tribal-engagement-summary.docx",
          title: "Tribal Engagement Summary",
          bucket: "mako-outbox-attachments-635052997545",
          key: "5b02dcea-4723-4dba-b2c1-15bde348f1f2.docx",
          uploadDate: Date.now(),
        },
      ],
    },
    existingStatePlanPages: {
      label: "Existing State Plan Page(s)",
      files: [
        {
          filename: "page-23-update.pdf",
          title: "Page 23 Update",
          bucket: "mako-outbox-attachments-635052997545",
          key: "2c46eaa6-abb2-4987-9b24-16a4f8c2825a.pdf",
          uploadDate: Date.now(),
        },
      ],
    },
    publicNotice: {
      label: "Public Notice",
      files: [
        {
          filename: "public-notice-oct-2024.pdf",
          title: "Public Notice - October 2024",
          bucket: "mako-outbox-attachments-635052997545",
          key: "7dd0e2bb-c5d3-47d4-bf23-dae48229f1b2.pdf",
          uploadDate: Date.now(),
        },
      ],
    },
    spaPages: {
      files: [
        {
          filename: "spa-page1.pdf",
          title: "SPA Page 1",
          bucket: "mako-outbox-attachments-635052997545",
          key: "3aa8c5ec-a6de-4415-bc5a-eef752d68af2.pdf",
          uploadDate: Date.now(),
        },
        {
          filename: "spa-page2.pdf",
          title: "SPA Page 2",
          bucket: "mako-outbox-attachments-635052997545",
          key: "4aa8c5ec-a6de-4415-bc5a-eef752d68af2.pdf",
          uploadDate: Date.now(),
        },
      ],
      label: "SPA Pages",
    },
    cmsForm179: {
      files: [
        {
          filename: "cms-form-179.pdf",
          title: "CMS Form 179 Submission",
          bucket: "mako-outbox-attachments-635052997545",
          key: "12fb2e5d-7d01-441c-a5b1-bbcc72a8adf1.pdf",
          uploadDate: Date.now(),
        },
      ],
      label: "CMS Form 179",
    },
    appk: {
      files: [
        {
          filename: "appendix-k-amendment.docx",
          title: "Appendix K Amendment",
          bucket: "mako-outbox-attachments-635052997545",
          key: "8b56f7ab-e1ad-4782-87f4-d43ab9d2f5d7.docx",
          uploadDate: Date.now(),
        },
      ],
      label: "1915(c) Appendix K Amendment Waiver Template",
    },
    amendedLanguage: {
      files: [
        {
          filename: "amended-language-1.pdf",
          title: "Amended Language - Section 1",
          bucket: "mako-outbox-attachments-635052997545",
          key: "1df7c8ef-a28d-41b8-9327-21767c16a11a.pdf",
          uploadDate: Date.now(),
        },
        {
          filename: "amended-language-2.pdf",
          title: "Amended Language - Section 2",
          bucket: "mako-outbox-attachments-635052997545",
          key: "23df1f2c-9927-4d82-a58f-31fd4729b2e5.pdf",
          uploadDate: Date.now(),
        },
      ],
      label: "SPA Pages",
    },
    coverLetter: {
      files: [
        {
          filename: "cover-letter-george-harrison.pdf",
          title: "Cover Letter - George Harrison",
          bucket: "mako-outbox-attachments-635052997545",
          key: "8c7e8d9f-c332-499c-bb21-d14fb9f8e20b.pdf",
          uploadDate: Date.now(),
        },
      ],
      label: "Cover Letter",
    },
    budgetDocuments: {
      label: "Budget Documents",
      files: [
        {
          filename: "fy2024-budget.xlsx",
          title: "FY2024 Budget Overview",
          bucket: "mako-outbox-attachments-635052997545",
          key: "5e9dc2f3-71f4-4145-95b6-f6371cdea3ef.xlsx",
          uploadDate: Date.now(),
        },
      ],
    },
    tribalConsultation: {
      label: "Tribal Consultation",
      files: [
        {
          filename: "tribal-consultation-sept-2024.pdf",
          title: "Tribal Consultation - September 2024",
          bucket: "mako-outbox-attachments-635052997545",
          key: "7a71e2b3-1d87-429c-99c8-f872ffdbb3f3.pdf",
          uploadDate: Date.now(),
        },
      ],
    },
    other: {
      label: "Other",
      files: [
        {
          filename: "misc-documents.pdf",
          title: "Miscellaneous Documents",
          bucket: "mako-outbox-attachments-635052997545",
          key: "c22aa4dc-e1b6-41d5-bf64-e45b6f74f5af.pdf",
          uploadDate: Date.now(),
        },
      ],
    },
    sfq: {
      label: "Standard Funding Questions (SFQs)",
      files: [
        {
          filename: "funding-questions-sfq.docx",
          title: "Standard Funding Questions",
          bucket: "mako-outbox-attachments-635052997545",
          key: "8d02fabb-9c01-41b4-a75d-e365bbed3d6a.docx",
          uploadDate: Date.now(),
        },
      ],
    },
  },
  proposedEffectiveDate: Date.now() + 5184000000,
};

export const successfulResponse = {
  $metadata: {
    httpStatusCode: 200,
    requestId: "d1e89223-05e6-4aad-9c7a-c93ac045e2ef",
    extendedRequestId: undefined,
    cfId: undefined,
    attempts: 1,
    totalRetryDelay: 0,
  },
  MessageId: "0100019142162cb7-62fb677b-c27e-4ccc-b3d3-20b8776a2605-000000",
};
