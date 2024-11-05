import { emailTemplateValue } from "../data";
import { Events } from "shared-types";
import { CommonEmailVariables } from "shared-types";
import { Text } from "@react-email/components";
import { PackageDetails, ContactStateLead, DetailsHeading, MailboxNotice } from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";
import { styles } from "../../email-styles";

export const ChipSpaStateEmail = (props: { variables: Events["NewChipSubmission"] & CommonEmailVariables }) => {
  const variables = props.variables;
  const previewText = `CHIP SPA ${variables.id} Submitted`;
  const heading = "This response confirms the submission of your CHIP State Plan Amendment to CMS:";

  return (
    <BaseEmailTemplate
      previewText={previewText}
      heading={heading}
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<ContactStateLead isChip />}
    >
      <DetailsHeading />
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          Name: variables.submitterName,
          Email: variables.submitterEmail,
          "CHIP SPA Package ID": variables.id,
          Summary: variables.additionalInformation,
        }}
      />
      <Text style={{ ...styles.text.base, marginTop: "16px" }}>
        This response confirms the receipt of your CHIP State Plan Amendment (CHIP SPA). You can expect a formal response to your submittal from CMS
        at a later date.
      </Text>
      <MailboxNotice type="SPA" />
    </BaseEmailTemplate>
  );
};

// to preview on 'email-dev'
const ChipSpaStateEmailPreview = () => {
  return (
    <ChipSpaStateEmail
      variables={{
        ...emailTemplateValue,
        id: "CO-24-1234",
        authority: "Medicaid SPA",
        event: "new-chip-submission",
        actionType: "Amend",
        origin: "mako",
      }}
    />
  );
};

export default ChipSpaStateEmailPreview;
