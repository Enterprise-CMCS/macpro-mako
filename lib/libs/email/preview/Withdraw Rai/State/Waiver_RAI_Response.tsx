import { Waiver1915bStateEmail } from "../../content/respondToRai/emailTemplates";
import { emailTemplateValue } from "../../mock-data/respond-to-rai";

const Waiver1915bStateEmailPreview = () => {
  return (
    <Waiver1915bStateEmail
      variables={{
        ...emailTemplateValue,
        id: "CO-1234.R21.00",
        territory: "CO",
        event: "respond-to-rai",
        attachments: {
          revisedAmendedStatePlanLanguage: {
            files: [
              {
                filename: "waiver-rai-response.pdf",
                title: "Waiver RAI Response",
                bucket: "test-bucket",
                key: "waiver-rai-response.pdf",
                uploadDate: Date.now(),
              },
              {
                filename: "spa-pages.pdf",
                title: "SPA Pages",
                bucket: "test-bucket",
                key: "spa-pages.pdf",
                uploadDate: Date.now(),
              },
            ],
            label: "Revised Amended State Plan Language",
          },
          officialRAIResponse: {
            files: [],
            label: "Official RAI Response",
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

export default Waiver1915bStateEmailPreview;
