import { Events } from "shared-types";
import { formatNinetyDaysDate, formatDate } from "shared-utils";
import { CommonEmailVariables } from "shared-types";
import {
  PackageDetails,
  ContactStateLead,
  DetailsHeading,
  MailboxNotice,
} from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";
import { Text } from "@react-email/components";
import { styles } from "../../email-styles";

export const MedSpaStateEmail = (props: {
  variables: Events["NewMedicaidSubmission"] & CommonEmailVariables;
}) => {
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
          "Proposed Effective Date": formatDate(variables.proposedEffectiveDate),
          "90th Day Deadline": formatNinetyDaysDate(variables.timestamp),
          Summary: variables.additionalInformation,
        }}
      />
      <Text style={styles.text.description}>
        {`This response confirms the receipt of your Medicaid State Plan Amendment
        (SPA). You can expect a formal response to your submittal to be issued
        within 90 days, before ${formatNinetyDaysDate(variables.timestamp)}.`}
      </Text>
      <MailboxNotice type="SPA" />
    </BaseEmailTemplate>
  );
};
