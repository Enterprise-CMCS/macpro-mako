import { emailTemplateValue } from "../data";
import { CommonEmailVariables, Events } from "shared-types";
import { Html, Container } from "@react-email/components";
import { PackageDetails, SpamWarning } from "../../email-components";

export const Waiver1915bCMSEmail = (props: {
  variables:
    | Events["CapitatedInitial"]
    | (Events["ContractingInitial"] & CommonEmailVariables);
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <Container>
        <h3>
          The OneMAC Submission Portal received a request to withdraw the
          package below. The package will no longer be considered for CMS
          review:
        </h3>
        <PackageDetails
          details={{
            "State or territory": variables.territory,
            Name: variables.submitterName,
            Email: variables.submitterEmail,
            [`${variables.authority} Package ID`]: variables.id,
            Summary: variables.additionalInformation,
          }}
          attachments={variables.attachments}
        />
        <SpamWarning />
      </Container>
    </Html>
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
