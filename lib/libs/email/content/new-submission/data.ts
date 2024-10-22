export const emailTemplateValue = {
  to: "George Harrison <george@example.com>",
  id: "C0-24-8110",
  territory: "CO",
  applicationEndpointUrl: "https://onemac.cms.gov/",
  authority: "CHIP SPA",
  timestamp: 1121234556,
  submitterName: "George Harrison",
  submitterEmail: "george@example.com",
  additionalInformation: "This is additional information",
  attachments: {
    currentStatePlan: {
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
    amendedLanguage: {
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
      files: [
        {
          filename: "cover-leter.pdf",
          title: "test",
          bucket: "mako-outbox-attachments-635052997545",
          key: "f581c0ec-cbb2-4875-a384-86c06136f4c4.pdf",
          uploadDate: 1728493784252,
        },
      ],
      label: "Cover Letter",
    },
    budgetDocuments: {
      label: "Document Demonstrating Good-Faith Tribal Engagement",
    },
    publicNotice: {
      label: "Existing State Plan Page(s)",
    },
    tribalConsultation: {
      label: "Tribal Consultation",
    },
    other: {
      label: "Other",
    },
  },
  proposedEffectiveDate: 1725062400000,
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
