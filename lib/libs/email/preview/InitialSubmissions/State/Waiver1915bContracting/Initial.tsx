import { Waiver1915bStateEmail } from "libs/email/content/newSubmission/emailTemplates";
import { emailTemplateValue } from "libs/email/mock-data/new-submission";
import { formatActionType } from "shared-utils";

export default () => {
  return (
    <Waiver1915bStateEmail
      variables={{
        ...emailTemplateValue,
        additionalInformation:
          "This is text\n\n\nwith a bunch of b/n linebreaks\n\n\n\n\n\n\n\n to test that linebreaks get converted to <br> elements",
        attachments: {
          b4WaiverApplication: {
            label: "1915(b) Comprehensive (Contracting) Waiver Application Pre-print",
            files: [
              {
                filename: "contracting-waiver-application.pdf",
                title: "test.pdf",
                bucket: "test",
                key: "test",
                uploadDate: Date.now(),
              },
              {
                filename: "contracting-waiver-application-2.pdf",
                title: "contracting-waiver-supporting-evidence.pdf",
                bucket: "test",
                key: "test2",
                uploadDate: Date.now(),
              },
            ],
          },

          tribalConsultation: { label: "Tribal Consultation", files: [] },
          other: { label: "Other", files: [] },
        },
        event: "contracting-initial",
        id: "CO-9987.R21.00",
        authority: "1915(b)",
        actionType: formatActionType("New"),
      }}
    />
  );
};
