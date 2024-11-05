import { emailTemplateValue } from "../data";
import { CommonEmailVariables, Events } from "shared-types";
import {
  Attachments,
  DetailsHeading,
  LoginInstructions,
  PackageDetails,
  BasicFooter,
} from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";
import { formatDate } from "shared-utils";

export const Waiver1915bCMSEmail = (props: {
  variables: Events["NewMedicaidSubmission"] & CommonEmailVariables;
}) => {
  const variables = props.variables;
  const previewText = `${variables.authority} ${variables.actionType} Submitted`;
  const heading = `The OneMAC Submission Portal received a ${variables.authority} ${variables.actionType} Submission:`;
  return (
    <BaseEmailTemplate
      previewText={previewText}
      heading={heading}
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<BasicFooter />}
    >
      <DetailsHeading />
      <LoginInstructions appEndpointURL={variables.applicationEndpointUrl} />
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          Name: variables.submitterName,
          "Email Address": variables.submitterEmail,
          [`${variables.actionType} Number`]: variables.id,
          "Waiver Authority": variables.authority,
          "Proposed Effective Date": formatDate(variables.proposedEffectiveDate),
          Summary: variables.additionalInformation,
        }}
      />
      <Attachments attachments={variables.attachments as any} />
    </BaseEmailTemplate>
  );
};

const Waiver1915bCMSEmailPreview = () => {
  return (
    <Waiver1915bCMSEmail
      variables={{
        ...emailTemplateValue,
        id: "CO-1234.R21.00",
        event: "new-medicaid-submission",
        origin: "mako",
        authority: "1915(b)",
        actionType: "Initial Waiver",
      }}
    />
  );
};
export default Waiver1915bCMSEmailPreview;
