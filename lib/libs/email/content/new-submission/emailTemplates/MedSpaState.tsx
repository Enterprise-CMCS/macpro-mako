import { Events } from "shared-types";
import { formatNinetyDaysDate, getDateFromMillis } from "shared-utils";
import { CommonEmailVariables } from "shared-types";
import { PackageDetails, ContactStateLead, DetailsHeading, MailboxNotice } from "../../email-components";
import { emailTemplateValue } from "../data";
import { BaseEmailTemplate } from "../../email-templates";
import { Text } from "@react-email/components";
import { styles } from "../../email-styles";

export const MedSpaStateEmail = (props: { variables: Events["NewMedicaidSubmission"] & CommonEmailVariables }) => {
  const variables = props.variables;
  const previewText = `Medicaid SPA &${variables.id} Submitted`;
  const heading = "This response confirms that you submitted a Medicaid SPA to CMS for review:";
  return (
    <BaseEmailTemplate
      previewText={previewText}
      heading={heading}
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<ContactStateLead />}
    >
      <DetailsHeading />
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          Name: variables.submitterName,
          "Email Address": variables.submitterEmail,
          "Medicaid SPA ID": variables.id,
          "Proposed Effective Date": getDateFromMillis(variables.proposedEffectiveDate),
          "90th Day Deadline": formatNinetyDaysDate(variables.timestamp),
          Summary: variables.additionalInformation,
        }}
      />
      {/* <Attachments attachments={variables.attachments} /> */}
      <Text style={styles.text.base}>
        {`This response confirms the receipt of your Medicaid State Plan Amendment
        (SPA or your response to a SPA Request for Additional Information
        (RAI). You can expect a formal response to your submittal to be issued
        within 90 days, before ${formatNinetyDaysDate(variables.timestamp)}.`}
      </Text>
      <MailboxNotice type="SPA" />
    </BaseEmailTemplate>
  );
};

const MedSpaStateEmailPreview = () => {
  return (
    <MedSpaStateEmail
      variables={{
        ...emailTemplateValue,
        id: "CO-24-1234",
        origin: "mako",
        event: "new-medicaid-submission",
        authority: "Medicaid SPA",
        actionType: "Amend",
      }}
    />
  );
};

export default MedSpaStateEmailPreview;
