import { CommonEmailVariables, Events } from "shared-types";
import {
  ContactStateLead,
  BasicFooter,
  PackageDetails,
  MailboxNotice,
  Divider,
} from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";

export const WaiverStateEmail = ({
  variables,
}: {
  variables: Events["WithdrawPackage"] & CommonEmailVariables;
}) => {
  return (
    <BaseEmailTemplate
      previewText={`Withdrawal of ${variables.authority} ${variables.id}`}
      heading={`This is confirmation that you have requested to withdraw the package below. The package will no longer be considered for CMS review:`}
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<BasicFooter />}
    >
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          Name: variables.submitterName,
          "Email Address": variables.submitterEmail,
          "Waiver Number": variables.id,
          Summary: variables.additionalInformation,
        }}
      />
      <Divider />
      <MailboxNotice type="Waiver" />
      <ContactStateLead />
    </BaseEmailTemplate>
  );
};
