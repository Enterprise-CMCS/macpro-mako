export const emailTemplateValue = {
  to: "TO",
  id: "PACKAGE ID",
  territory: "CO",
  applicationEndpointUrl: "https://mako-dev.cms.gov",
  actionType: "Withdrawal",
  authority: "AUTHORITY",
  origin: "mako",
  requestedDate: 1723390633663,
  withdrawnDate: 1723390633663,
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
          filename: "test.pdf",
          title: "test",
          bucket: "mako-outbox-attachments-635052997545",
          key: "f581c0ec-cbb2-4875-a384-86c06136f4c4.pdf",
          uploadDate: 1728493784252,
        },
      ],
      label: "SPA Pages",
    },
  },
  additionalInformation: "This bens additional infornormaiton",
  submitterName: "George Harrison",
  submitterEmail: "george@example.com",
  timestamp: 1723390633663,
};
