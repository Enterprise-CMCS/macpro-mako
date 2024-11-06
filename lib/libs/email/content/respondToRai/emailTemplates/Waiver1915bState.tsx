import { emailTemplateValue } from "../data";
import { formatNinetyDaysDate } from "shared-utils";
import { CommonEmailVariables, Events } from "shared-types";
import { Text } from "@react-email/components";
import { PackageDetails, MailboxNotice, ContactStateLead } from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";
import { styles } from "../../email-styles";

export const Waiver1915bStateEmail = (props: {
  variables: Events["RespondToRai"] & CommonEmailVariables;
}) => {
  const variables = props.variables;
  const previewText = `Appendix K Amendment Submitted`;
  const heading = "This response confirms the submission of your 1915(c) Waiver to CMS for review";
  return (
    <BaseEmailTemplate
      previewText={previewText}
      heading={heading}
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<ContactStateLead />}
    >
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          Name: variables.submitterName,
          "Email Address": variables.submitterEmail,
          "Initial Waiver Number": variables.id,
          "Waiver Authority": variables.authority,
          "90th Day Deadline": formatNinetyDaysDate(variables.responseDate),
          Summary: variables.additionalInformation,
        }}
      />
      <Text style={styles.text.description}>
        {`This response confirms the receipt of your Waiver request or your response to a Waiver
        Request for Additional Information (RAI). You can expect a formal response to your submittal
        to be issued within 90 days, before ${formatNinetyDaysDate(variables.timestamp)}`}
        .
      </Text>
      <MailboxNotice type="Waiver" />
    </BaseEmailTemplate>
  );
};

const Waiver1915bStateEmailPreview = () => {
  return (
    <Waiver1915bStateEmail
      variables={{
        ...emailTemplateValue,
        id: "CO-1234.R21.00",
        territory: "CO",
        authority: "Waiver 1915b",
        attachments: {
          cmsForm179: {
            label: "CMS Form 179",
            files: [
              {
                filename: "cms-form-179.pdf",
                title: "CMS Form 179",
                bucket: "test-bucket",
                key: "cms-form-179.pdf",
                uploadDate: Date.now(),
              },
            ],
          },
          spaPages: { label: "SPA Pages", files: [] },
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

export default Waiver1915bStateEmailPreview;
