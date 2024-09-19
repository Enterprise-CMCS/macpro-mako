import * as React from "react";
import { emailTemplateValue } from "../data";
import { OneMac } from "shared-types";
import { CommonVariables } from "../../..";
import { Html, Container } from "@react-email/components";
import { PackageDetails, ContactStateLead } from "../../email-components";

export const ChipSpaStateEmail = (props: {
  variables: OneMac & CommonVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <Container>
        <h3>
          This is confirmation that you submitted a CHIP State Plan Amendment to
          CMS for review:
        </h3>
        <PackageDetails
          details={{
            "State or territory": variables.territory,
            Name: variables.submitterName,
            "Email Address": variables.submitterEmail,
            "CHIP SPA Package ID": variables.id,
            Summary: variables.additionalInformation,
          }}
        />
        <p>
          This response confirms the receipt of your CHIP State Plan Amendment
          (CHIP SPA). You can expect a formal response to your submittal from
          CMS at a later date.
        </p>
        <ContactStateLead isChip />
      </Container>
    </Html>
  );
};

// to preview on 'email-dev'
const ChipSpaStateEmailPreview = () => {
  return (
    <ChipSpaStateEmail
      variables={emailTemplateValue as OneMac & CommonVariables}
    />
  );
};

export default ChipSpaStateEmailPreview;
