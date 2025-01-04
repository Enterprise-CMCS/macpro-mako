import { ChipSpaStateEmail } from "../../../content/withdrawPackage/emailTemplates";
import { emailTemplateValue } from "../../../mock-data/new-submission";

export default () => {
  return (
    <ChipSpaStateEmail
      variables={{
        ...emailTemplateValue,
        authority: "CHIP SPA",
        event: "withdraw-package",
        id: "CO-1234.R21.00",
        actionType: "New",
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
