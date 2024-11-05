export const emailTemplateValue = {
  to: "TO",
  id: "PACKAGE ID",
  territory: "CO",
  applicationEndpointUrl: "https://onemac.cms.gov/",

  timestamp: 1723390633663,
  authority: "AUTHORITY",
  actionType: "ACTION TYPE",
  origin: "mako",
  requestedDate: 1723390633663,
  responseDate: 1723390633663,
  additionalInformation: "This bens additional infornormaiton",
  submitterName: "George Harrison",
  submitterEmail: "george@example.com",
  attachments: {
    cmsForm179: {
      files: [
        {
          filename: "CMS_Form_179_RAI_Response.pdf",
          title: "CMS Form 179 Form",
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
          title: "SPA Pages",
          bucket: "mako-outbox-attachments-635052997545",
          key: "f581c0ec-cbb2-4875-a384-86c06136f4c4.pdf",
          uploadDate: 1728493784252,
        },
      ],
      label: "SPA Pages",
    },
  },
  notificationMetadata: {
    submissionDate: 1723420800000,
    proposedEffectiveDate: 1725062400000,
  },
};
