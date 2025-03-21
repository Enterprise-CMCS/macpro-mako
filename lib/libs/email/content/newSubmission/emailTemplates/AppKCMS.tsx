import { CommonEmailVariables, Events } from "shared-types";
import { formatDate } from "shared-utils";

import {
  Attachments,
  BasicFooter,
  Divider,
  LoginInstructions,
  PackageDetails,
} from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";

type AppKEmailProps = Events["AppKSubmission"] & CommonEmailVariables;

// 1915c - app K
export const AppKCMSEmail = ({ variables }: { variables: AppKEmailProps }) => {
  return (
    <BaseEmailTemplate
      previewText="Appendix K Amendment Submitted"
      heading="The OneMAC Submission Portal received a 1915(c) Appendix K Amendment Submission:"
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<BasicFooter />}
    >
      <Divider />
      <LoginInstructions appEndpointURL={variables.applicationEndpointUrl} useThisLink />
      <PackageDetails
        details={{
          "State or Territory": variables.territory,
          Name: variables.submitterName,
          "Email Address": variables.submitterEmail,
          "Amendment Title": variables.title ?? null,
          "Waiver Amendment Number": variables.id,
          "Waiver Authority": variables.authority,
          "Proposed Effective Date": formatDate(variables.proposedEffectiveDate),
          Summary: variables.additionalInformation,
        }}
      />
      <Attachments attachments={variables.attachments} />
    </BaseEmailTemplate>
  );
};
