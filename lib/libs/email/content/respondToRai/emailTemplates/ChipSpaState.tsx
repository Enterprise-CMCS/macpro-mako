import * as React from "react";
import { emailTemplateValue } from "../data";
import { CommonVariables, formatNinetyDaysDate } from "../../..";
import { RaiResponse } from "shared-types";
import { Html, Container } from "@react-email/components";
import { ContactStateLead, PackageDetails } from "../../email-components";

export const ChipSpaStateEmail = (props: {
  variables: RaiResponse & CommonVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <Container>
        <h3>
          This response confirms you submitted a CHIP SPA RAI Response to CMS
          for review:
        </h3>
        <PackageDetails
          details={{
            "State or territory": variables.territory,
            Name: variables.submitterName,
            "Email Address": variables.submitterEmail,
            "CHIP SPA Package ID": variables.id,
            "90th Day Deadline": formatNinetyDaysDate(variables.responseDate),
            Summary: variables.additionalInformation,
          }}
        />
        <p>
          This response confirms receipt of your CHIP State Plan Amendment (SPA
          or your response to a SPA Request for Additional Information (RAI)).
          You can expect a formal response to your submittal to be issued within
          90 days, before {formatNinetyDaysDate(variables.responseDate)}.
        </p>
        <ContactStateLead isChip />
      </Container>
    </Html>
  );
};

const ChipSpaStateEmailPreview = () => {
  return (
    <ChipSpaStateEmail
      variables={emailTemplateValue as RaiResponse & CommonVariables}
    />
  );
};

export default ChipSpaStateEmailPreview;
