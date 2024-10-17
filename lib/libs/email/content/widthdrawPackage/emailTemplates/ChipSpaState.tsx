import * as React from "react";
import { emailTemplateValue } from "../data";
import { CommonVariables } from "../../..";
import { WithdrawPackage } from "shared-types";
import { Html, Container } from "@react-email/components";
import { ContactStateLead } from "../../email-components";

export const ChipSpaStateEmail = (props: {
  variables: WithdrawPackage & CommonVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <Container>
        <h3>
          This email is to confirm CHIP SPA {variables.id} was withdrawn by
          {variables.submitterName}. The review of CHIP SPA {variables.id} has
          concluded.
        </h3>
        <ContactStateLead isChip />
      </Container>
    </Html>
  );
};

const ChipSpaStateEmailPreview = () => {
  return (
    <ChipSpaStateEmail
      variables={emailTemplateValue as WithdrawPackage & CommonVariables}
    />
  );
};

export default ChipSpaStateEmailPreview;
