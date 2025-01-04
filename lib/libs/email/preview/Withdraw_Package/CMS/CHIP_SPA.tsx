import { ChipSpaCMSEmail } from "../../../content/withdrawPackage/emailTemplates/ChipSpaCMS";
import { emailTemplateValue } from "../../../mock-data/new-submission";

export default () => {
  return (
    <ChipSpaCMSEmail
      variables={{
        ...emailTemplateValue,
        authority: "CHIP SPA",
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
