import { ChipSpaCMSEmail } from "../../content/respondToRai/emailTemplates";
import { emailTemplateValue } from "../../mock-data/respond-to-rai";

export const ChipSpaCMSEmailPreview = () => {
  return (
    <ChipSpaCMSEmail
      variables={{
        ...emailTemplateValue,
        id: "CO-24-1055-0001",
        territory: "CO",
        attachments: {
          cmsForm179: {
            files: [
              {
                filename: "CMS_Form_179_RAI_Response.pdf",
                title: "CMS Form 179",
                bucket: "test-bucket",
                key: "cms-form-179.pdf",
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
                bucket: "test-bucket",
                key: "spa-pages.pdf",
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
        authority: "CHIP SPA",
      }}
    />
  );
};

export default ChipSpaCMSEmailPreview;
