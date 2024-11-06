export const emailTemplateValue = {
  event: "temporary-extension" as const,
  territory: "MD",
  id: "MD-2343.R00.TE09",
  waiverNumber: "MD-2343.R00.TE00",
  authority: "1915(b)",
  actionType: "Extend",
  applicationEndpointUrl: "https://mako-dev.cms.gov/",
  timestamp: Date.now(),
  submitterName: "George Harrison",
  submitterEmail: "george@example.com",
  additionalInformation:
    "Whoever fights monsters should see to it that in the process he does not become a monster. And if you gaze long enough into an abyss, the abyss will gaze back into you.",
  origin: "mako" as const,
  appkParentId: null,
  attachments: {
    waiverExtensionRequest: {
      files: [
        {
          filename: "Temporary Extention Document for submission.pdf",
          title: "Temporary Extention Document for submission",
          bucket: "mako-outbox-attachments-635052997545",
          key: "8d02fabb-9c01-41b4-a75d-e365bbed3d6a.pdf",
          uploadDate: Date.now(),
        },
        {
          filename: "Second Extention Document for submission.pdf",
          title: "TempSecondorary Extention Document for submission",
          bucket: "mako-outbox-attachments-635052997545",
          key: "8d02fabb-9c01-41b4-a75d-e365bbed3d6a.pdf",
          uploadDate: Date.now(),
        },
        {
          filename: "Third Extention Document for submission.pdf",
          title: "Third Temporary Extention Document for submission",
          bucket: "mako-outbox-attachments-635052997545",
          key: "8d02fabb-9c01-41b4-a75d-e365bbed3d6a.pdf",
          uploadDate: Date.now(),
        },
      ],
      label: "Waiver Extension Request",
    },
    other: {
      files: [],
      label: "Other",
    },
  },
  proposedEffectiveDate: Date.now() + 5184000000,
};
