import { WaiverStateEmail } from "../../../content/withdrawPackage/emailTemplates";
import { emailTemplateValue } from "../../../mock-data/new-submission";

export default () => {
  return (
    <WaiverStateEmail
      variables={{
        ...emailTemplateValue,
        authority: "1915(b)",
        event: "withdraw-package",
        id: "CO-1234.R21.00",
        actionType: "Amend",
        attachments: {
          supportingDocumentation: {
            label: "Supporting Documentation",
            files: [
              {
                filename: "supportingDocumentation.pdf",
                title: "Supporting Documentation",
                bucket: "mock-data",
                key: "attachments/supportingDocumentation.pdf",
                uploadDate: 1719859200,
              },
            ],
          },
        },
      }}
    />
  );
};
