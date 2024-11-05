import { emailTemplateValue } from "../data";
import { formatNinetyDaysDate } from "shared-utils";
import { CommonEmailVariables, Events } from "shared-types";
import { Text } from "@react-email/components";
import { PackageDetails, MailboxNotice, ContactStateLead } from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";
import { styles } from "../../email-styles";

export const MedSpaStateEmail = (props: {
  variables: Events["RespondToRai"] & CommonEmailVariables;
}) => {
  const variables = props.variables;
  const previewText = `Medicaid SPA ${variables.id} RAI Response Submitted`;
  const heading =
    "This response confirms you submitted a Medicaid SPA RAI Response to CMS for review";
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
          "Medicaid SPA ID": variables.id,
          "90th Day Deadline": formatNinetyDaysDate(variables.responseDate),
          Summary: variables.additionalInformation,
        }}
      />
      <Text style={styles.text.description}>
        This response confirms receipt of your Medicaid State Plan Amendment (SPA) or your response
        to a SPA Request for Additional Information (RAI). You can expect a formal response to your
        submittal to be issued within 90 days, before {formatNinetyDaysDate(variables.responseDate)}
        .
      </Text>
      <MailboxNotice type="SPA" />
    </BaseEmailTemplate>
  );
};

export const MedSpaStateEmailPreview = () => {
  return (
    <MedSpaStateEmail variables={{ ...emailTemplateValue, origin: "mako", attachments: [] }} />
  );
};

MedSpaStateEmailPreview.displayName = "MedSpaStateEmailPreview";

MedSpaStateEmail.displayName = "MedSpaStateEmail";

export default MedSpaStateEmailPreview;
