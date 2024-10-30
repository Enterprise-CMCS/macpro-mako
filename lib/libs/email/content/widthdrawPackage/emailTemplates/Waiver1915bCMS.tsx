import { emailTemplateValue } from "../data";
import { CommonEmailVariables, Events } from "shared-types";
import {
  Attachments,
  PackageDetails,
  BasicFooter,
} from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";

export const Waiver1915bCMSEmail = (props: {
  variables:
    | (Events["CapitatedInitial"] & CommonEmailVariables)
    | (Events["ContractingInitial"] & CommonEmailVariables);
}) => {
  const variables = props.variables;
  const previewText = `Withdrawal of ${variables.authority} ${variables.id}`;
  const heading =
    "The OneMAC Submission Portal received a request to withdraw the package below. The package will no longer be considered for CMS review:";
  return (
    <BaseEmailTemplate
      previewText={previewText}
      heading={heading}
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<BasicFooter />}
    >
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          Name: variables.submitterName,
          Email: variables.submitterEmail,
          [`${variables.authority} Package ID`]: variables.id,
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
        event: "capitated-initial",
        authority: "Medicaid Waiver",
        origin: "mako",
        submitterEmail: "george@example.com",
        submitterName: "George Harrison",
      }}
    />
  );
};

export default Waiver1915bCMSEmailPreview;
