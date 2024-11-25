export const emailTemplateValue = {
  territory: "CO",
  applicationEndpointUrl: "https://mako-dev.cms.gov/",
  actionType: "Upload-Subsequent-Documents",
  origin: "mako",
  requestedDate: Date.now() - 5 * 24 * 60 * 60,
  withdrawnDate: Date.now(),
  attachments: {
    cmsForm179: {
      files: [
        {
          filename: "withdraw-documentation.pdf",
          title: "withdraw-documentation",
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
          filename: "Addditional Information.pdf",
          title: "Addditional Information",
          bucket: "mako-outbox-attachments-635052997545",
          key: "f581c0ec-cbb2-4875-a384-86c06136f4c4.pdf",
          uploadDate: 1728493784252,
        },
      ],
      label: "SPA Pages",
    },
  },
  additionalInformation:
    "This some additional infornormaiton about the request to withdraw and what makes it important.",
  submitterName: "George Harrison",
  submitterEmail: "george@example.com",
  timestamp: 1723390633663,
};
