import { ChipSpaCMSEmail } from "../../content/respondToRai/emailTemplates";
import { emailTemplateValue } from "../../mock-data/respond-to-rai";

export const ChipSpaCMSEmailPreview = () => {
  return (
    <ChipSpaCMSEmail
      variables={{
        ...emailTemplateValue,
        id: "CO-24-1055-0001",
        territory: "CO",
        event: "respond-to-rai",
        attachments: {
          revisedAmendedStatePlanLanguage: {
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
          officialRAIResponse: {
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
          budgetDocuments: {
            files: [],
            label: "Budget Documents",
          },
          publicNotice: {
            files: [],
            label: "Public Notice",
          },
          tribalConsultation: {
            files: [],
            label: "Tribal Consultation",
          },
          other: {
            files: [],
            label: "Other",
          },
        },
      }}
    />
  );
};

export default ChipSpaCMSEmailPreview;
