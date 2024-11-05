import { CommonEmailVariables, Events } from "shared-types";
import { Attachments, DetailsHeading, LoginInstructions, PackageDetails, BasicFooter } from "../../email-components";
import { emailTemplateValue } from "../data";
import { BaseEmailTemplate } from "../../email-templates";
import { getDateFromMillis } from "lib/packages/shared-utils";

export const MedSpaCMSEmail = (props: { variables: Events["NewMedicaidSubmission"] & CommonEmailVariables }) => {
  const variables = props.variables;
  const previewText = `Medicaid SPA ${variables.id} Submitted`;
  const heading = "The OneMAC Submission Portal received a Medicaid SPA Submission:";

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
          Email: variables.submitterEmail,
          "Medicaid SPA ID": variables.id,
          "Proposed Effective Date": getDateFromMillis(variables.proposedEffectiveDate),
          Summary: variables.additionalInformation,
        }}
      />
      <Attachments attachments={variables.attachments} />
    </BaseEmailTemplate>
  );
};

const MedSpaCMSEmailPreview = () => {
  return (
    <MedSpaCMSEmail
      variables={{
        ...emailTemplateValue,
        id: "CO-24-1234",
        authority: "Medicaid SPA",
        event: "new-medicaid-submission",
        actionType: "Amend",
        origin: "mako",
      }}
    />
  );
};

export default MedSpaCMSEmailPreview;
