export const key = "C0-24-8110";

export const emailTemplateValue = {
  id: "PACKAGE ID",
  territory: "CO",
  applicationEndpointUrl: "https://onemac.cms.gov/",
  timestamp: 1723390633663,
  authority: "AUTHORITY",
  seaActionType: "Amend",
  actionType: "ACTION TYPE",
  origin: "micro",
  appkParentId: null,
  originalWaiverNumber: null,
  additionalInformation: "This bens additional infornormaiton",
  submitterName: "George Harrison",
  submitterEmail: "george@example.com",
  attachments: {
    cmsForm179: {
      files: [
        {
          filename: "test.pdf",
          title: "test",
          bucket: "mako-outbox-attachments-635052997545",
          key: "b545ea14-6b1b-47c0-a374-743fcba4391f.pdf",
          uploadDate: 1728493782785,
        },
      ],
      label: "CMS Form 179",
    },
    spaPages: {
      files: [
        {
          filename: "test1.pdf",
          title: "test",
          bucket: "mako-outbox-attachments-635052997545",
          key: "f581c0ec-cbb2-4875-a384-86c06136f4c4.pdf",
          uploadDate: 1728493784252,
        },
        {
          filename: "test2.pdf",
          title: "test",
          bucket: "mako-outbox-attachments-635052997545",
          key: "f581c0ec-cbb2-4875-a384-86c06136f4c4.pdf",
          uploadDate: 1728493784252,
        },
        {
          filename: "test3.pdf",
          title: "test",
          bucket: "mako-outbox-attachments-635052997545",
          key: "f581c0ec-cbb2-4875-a384-86c06136f4c4.pdf",
          uploadDate: 1728493784252,
        },
      ],
      label: "SPA Pages",
    },
    coverLetter: {
      label: "Cover Letter",
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
    sfq: {
      label: "Standard Funding Questions (SFQs)",
    },
    tribalConsultation: {
      label: "Tribal Consultation",
    },
    other: {
      label: "Other",
    },
  },
  raiWithdrawEnabled: false,
  notificationMetadata: {
    submissionDate: 1723420800000,
    proposedEffectiveDate: 1725062400000,
  },
};

export const sucessfullRepsonse = {
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
