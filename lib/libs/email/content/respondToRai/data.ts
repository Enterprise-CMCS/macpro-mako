export const emailTemplateValue = {
  id: "CO-1234.R21.00",
  territory: "CO",
  applicationEndpointUrl: "https://mako-dev.cms.gov",
  timestamp: Date.now(),
  authority: "1915(b)",
  actionType: "Respond to Formal RAI",
  origin: "mako" as const,
  requestedDate: Date.now(),
  responseDate: Date.now(),
  additionalInformation:
    "Octopuses are usually very antisocial but when they’re under the influence of ecstasy they are more willing to spend time around each other or even hug other octopuses",
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
          uploadDate: Date.now(),
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
          uploadDate: Date.now(),
        },
      ],
      label: "SPA Pages",
    },
    other: {
      files: [],
      label: "Other",
    },
  },

  submissionDate: Date.now(),
  proposedEffectiveDate: Date.now() + 5184000000,
};
