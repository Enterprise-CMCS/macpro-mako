import { emailTemplateValue } from "../data";
import { CommonEmailVariables, Events } from "shared-types";
import { ContactStateLead } from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";

export const Waiver1915bStateEmail = (props: {
  variables:
    | (Events["CapitatedInitial"] & CommonEmailVariables)
    | (Events["ContractingInitial"] & CommonEmailVariables);
}) => {
  const variables = props.variables;
  const previewText = `Withdrawal of ${variables.authority} ${variables.id}`;
  const heading = `This email is to confirm $ {variables.authority} Waiver ${variables.id} was withdrawn by ${variables.submitterName}. The review of ${variables.authority} Waiver ${variables.id} has concluded`;
  return (
    <BaseEmailTemplate
      previewText={previewText}
      heading={heading}
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<ContactStateLead />}
    ></BaseEmailTemplate>
  );
};

const Waiver1915bStateEmailPreview = () => {
  return (
    <Waiver1915bStateEmail
      variables={{
        ...emailTemplateValue,
        actionType: "Withdraw",
        origin: "mako",
        submitterEmail: "george@example.com",
        submitterName: "George Harrison",
        event: "capitated-initial",
      }}
    />
  );
};

export default Waiver1915bStateEmailPreview;
