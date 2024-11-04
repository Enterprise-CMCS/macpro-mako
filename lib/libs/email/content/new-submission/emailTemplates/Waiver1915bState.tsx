import { emailTemplateValue } from "../data";
import { CommonEmailVariables } from "shared-types";
import { formatNinetyDaysDate, getDateFromMillis } from "shared-utils";
import { Text } from "@react-email/components";
import { PackageDetails, ContactStateLead, DetailsHeading, Attachments, MailboxNotice } from "../../email-components";
import { styles } from "../../email-styles";
import { BaseEmailTemplate } from "../../email-templates";

export const Waiver1915bStateEmail = (props: { variables: any & CommonEmailVariables }) => {
  const variables = props.variables;
  const previewText = `${variables.authority} ${variables.actionType} Submitted`;
  const heading = `This response confirms the submission of your ${variables.authority} ${variables.actionType} to CMS for review:`;
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
          [`${variables.actionType} Number`]: variables.id,
          "Waiver Authority": variables.authority,
          "Proposed Effective Date": getDateFromMillis(variables.proposedEffectiveDate),
          "90th Day Deadline": formatNinetyDaysDate(variables.timestamp),
          Summary: variables.additionalInformation,
        }}
      />
      <Attachments attachments={variables.attachments} />
      <Text style={{ ...styles.text, marginTop: "16px" }}>
        {`This response confirms the receipt of your Waiver request or your
              response to a Waiver Request for Additional Information (RAI). You
              can expect a formal response to your submittal to be issued within
              90 days, before
              ${formatNinetyDaysDate(variables.timestamp)}
              .`}
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
        authority: "1915(b)",
        actionType: "RAI",
      }}
    />
  );
};

export default Waiver1915bStateEmailPreview;
