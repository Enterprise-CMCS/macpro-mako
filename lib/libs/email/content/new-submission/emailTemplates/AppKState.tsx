import { Text } from "@react-email/components";
import { CommonEmailVariables, Events } from "shared-types";
import { formatNinetyDaysDate, formatDate } from "shared-utils";
import {
  PackageDetails,
  ContactStateLead,
  DetailsHeading,
  Attachments,
  MailboxNotice,
} from "../../email-components";
import { emailTemplateValue } from "../data";
import { BaseEmailTemplate } from "../../email-templates";
import { styles } from "../../email-styles";

export const AppKStateEmail = (props: {
  variables: Events["NewAppKSubmission"] & CommonEmailVariables;
}) => {
  const variables = props.variables;
  const previewText = `Appendix K Amendment Submitted`;
  const heading = "This response confirms the submission of your 1915(c) Waiver to CMS for review:";
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
          "Initial Waiver Numbers": variables.waiverIds.join(", "),
          "Waiver Authority": variables.seaActionType,
          "Proposed Effective Date": formatDate(variables.proposedEffectiveDate),
          "90th Day Deadline": formatNinetyDaysDate(variables.timestamp),
          Summary: variables.additionalInformation,
        }}
      />
      <Attachments attachments={variables.attachments} />
      <Text style={styles.text.description}>
        {`This response confirms the receipt of your Waiver request or your
        response to a Waiver Request for Additional Information (RAI). You can
        expect a formal response to your submittal to be issued within 90 days,
        before ${formatNinetyDaysDate(variables.timestamp)}.`}
      </Text>
      <MailboxNotice type="Waiver" />
    </BaseEmailTemplate>
  );
};

const AppKStateEmailPreview = () => {
  return (
    <AppKStateEmail
      variables={{
        ...emailTemplateValue,
        id: "CO-1234.R21.00",
        origin: "mako",
        state: "CO",
        waiverIds: ["1234-56768", "1234-56769"],
        actionType: "Amend",
        seaActionType: "Amend",
        title: "App K Title",
      }}
    />
  );
};

export default AppKStateEmailPreview;
