import * as React from "react";
import { emailTemplateValue } from "../data";
import { CommonEmailVariables } from "../../..";
import { WithdrawPackage } from "shared-types";
import { Html, Container } from "@react-email/components";
import { ContactStateLead } from "../../email-components";

export const Waiver1915bStateEmail = (props: {
  variables: WithdrawPackage & CommonEmailVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <Container>
        <h3>
          This email is to confirm {variables.authority} Waiver {variables.id}{" "}
          was withdrawn by {variables.submitterName}. The review of
          {variables.authority} Waiver {variables.id} has concluded.
        </h3>
        <ContactStateLead />
      </Container>
    </Html>
  );
};

const Waiver1915bStateEmailPreview = () => {
  return (
    <Waiver1915bStateEmail
      variables={emailTemplateValue as WithdrawPackage & CommonEmailVariables}
    />
  );
};

export default Waiver1915bStateEmailPreview;
