import { MedSpaCMSEmail } from "../../content/respondToRai/emailTemplates";
import { emailTemplateValue } from "../../mock-data/respond-to-rai";

const MedSpaCMSEmailPreview = () => {
  return (
    <MedSpaCMSEmail
      variables={{
        ...emailTemplateValue,
        id: "CO-1234.R21.00",
        territory: "CO",
        authority: "Medicaid SPA",
        attachments: {
          cmsForm179: {
            label: "CMS Form 179",
            files: [],
          },
          spaPages: {
            label: "SPA Pages",
            files: [
              {
                filename: "spa-pages.pdf",
                title: "SPA Pages",
                bucket: "test-bucket",
                key: "spa-pages.pdf",
                uploadDate: Date.now(),
              },
            ],
          },
          other: {
            label: "Other",
            files: [
              {
                filename: "other.pdf",
                title: "Other",
                bucket: "test-bucket",
                key: "other.pdf",
                uploadDate: Date.now(),
              },
            ],
          },
        },
      }}
    />
  );
};

export default MedSpaCMSEmailPreview;
