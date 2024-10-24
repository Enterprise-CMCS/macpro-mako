import * as React from "react";
import { emailTemplateValue } from "../data";
import { CommonEmailVariables, formatNinetyDaysDate } from "../../..";
import { RaiResponse } from "shared-types";
import { Html, Container } from "@react-email/components";
import {
  PackageDetails,
  MailboxSPA,
  ContactStateLead,
} from "../../email-components";

export const MedSpaStateEmail = (props: {
  variables: RaiResponse & CommonEmailVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <Container>
        <h3>
          This response confirms you submitted a Medicaid SPA RAI Response to
          CMS for review:
        </h3>
        <PackageDetails
          details={{
            "State or territory": variables.territory,
            Name: variables.submitterName,
            "Email Address": variables.submitterEmail,
            "Medicaid SPA ID": variables.id,
            "90th Day Deadline": formatNinetyDaysDate(variables.responseDate),
            Summary: variables.additionalInformation,
          }}
        />
        <p>
          This response confirms receipt of your Medicaid State Plan Amendment
          (SPA or your response to a SPA Request for Additional Information
          (RAI)). You can expect a formal response to your submittal to be
          issued within 90 days, before{" "}
          {formatNinetyDaysDate(variables.responseDate)}.
        </p>
        <MailboxSPA />
        <ContactStateLead />
      </Container>
    </Html>
  );
};

const MedSpaCMSEmailPreview = () => {
  return (
    <MedSpaStateEmail
      variables={emailTemplateValue as RaiResponse & CommonEmailVariables}
    />
  );
};

export default MedSpaCMSEmailPreview;
