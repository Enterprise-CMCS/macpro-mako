import { Events } from "lib/packages/shared-types/events";

export const emailTemplateValue: Omit<Events["WithdrawRai"], "id" | "authority"> = {
  event: "withdraw-rai" as const,
  origin: "mako" as const,
  attachments: {
    supportingDocumentation: {
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
  },
  additionalInformation:
    "This some additional information about the request to withdraw and what makes it important.",
  submitterName: "George Harrison",
  submitterEmail: "george@example.com",
  timestamp: 1723390633663,
};
