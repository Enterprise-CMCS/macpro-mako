import { CommonEmailVariables, Events } from "shared-types";
import { ContactStateLead, BasicFooter } from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";

export const WaiverStateEmail = (props: {
  variables:
    | (Events["CapitatedInitial"] & CommonEmailVariables)
    | (Events["ContractingInitial"] & CommonEmailVariables)
    | (Events["NewAppKSubmission"] & CommonEmailVariables);
}) => {
  const variables = props.variables;
  const previewText = `Withdrawal of ${variables.authority} ${variables.id}`;
  const heading = `This email is to confirm ${variables.authority} ${variables.id} was withdrawn by ${variables.submitterName}. The review of ${variables.authority} ${variables.id} has concluded.`;
  return (
    <BaseEmailTemplate
      previewText={previewText}
      heading={heading}
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<BasicFooter />}
    >
      <ContactStateLead />
    </BaseEmailTemplate>
  );
};
