import { Waiver1915bCMSEmail } from "../../content/respondToRai/emailTemplates";
import { emailTemplateValue } from "../../mock-data/respond-to-rai";

const Waiver1915bCMSEmailPreview = () => {
  return (
    <Waiver1915bCMSEmail
      variables={{
        ...emailTemplateValue,
        id: "CO-1234.R21.00",
        territory: "CO",
        event: "respond-to-rai",
        attachments: {
          revisedAmendedStatePlanLanguage: {
            files: [
              {
                filename: "revised-amended-state-plan-language.pdf",
                title: "Revised Amended State Plan Language",
                bucket: "test-bucket",
                key: "revised-amended-state-plan-language.pdf",
                uploadDate: Date.now(),
              },
            ],
            label: "Revised Amended State Plan Language",
          },
          officialRAIResponse: {
            files: [
              {
                filename: "official-rai-response.pdf",
                title: "Official RAI Response",
                bucket: "test-bucket",
                key: "official-rai-response.pdf",
                uploadDate: Date.now(),
              },
            ],
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

export default Waiver1915bCMSEmailPreview;
