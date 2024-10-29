import { Events, CommonEmailVariables } from "shared-types";

import {
  LoginInstructions,
  PackageDetails,
  SpamWarning,
  DetailsHeading,
  Attachments,
} from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";
import { emailTemplateValue } from "../data";
import { DateTime } from "luxon";

type AppKEmailProps = Events["NewAppKSubmission"] & CommonEmailVariables;

// 1915c - app K
export const AppKCMSEmail: React.FC<AppKEmailProps> = (variables) => {
  return (
    <BaseEmailTemplate
      previewText="Appendix K Amendment Submitted"
      heading="The OneMAC Submission Portal received a 1915(c) Appendix K Amendment Submission:"
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<SpamWarning />}
    >
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          Name: variables.submitterName,
          "Email Address": variables.submitterEmail,
          "Amendment Title": variables.title ?? null,
          "Waiver Amendment Number": variables.id,
          "Waiver Authority": variables.seaActionType,
          "Proposed Effective Date": DateTime.fromMillis(
            Number(variables.proposedEffectiveDate),
          ).toFormat("DDDD"),
          Summary: variables.additionalInformation,
        }}
      />
      <Attachments attachments={variables.attachments as any} />
      <DetailsHeading />
      <LoginInstructions appEndpointURL={variables.applicationEndpointUrl} />
    </BaseEmailTemplate>
  );
};

const AppKCMSEmailPreview = () => {
  return (
    <AppKCMSEmail
      {...{
        ...emailTemplateValue,
        waiverIds: ["CO-1234.R21.01", "CO-12345.R03.09", "CO-4567.R15.42"],
        actionType: "New",
        state: "CO",
        seaActionType: "New",
        title: "A Perfect Appendix K Amendment Title",
        origin: "mako",
      }}
    />
  );
};

export default AppKCMSEmailPreview;
