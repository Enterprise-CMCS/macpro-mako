import * as React from "react";
import { emailTemplateValue } from "../data";
import { CommonVariables } from "../../..";
import { WithdrawPackage } from "shared-types";
import { Html } from "@react-email/components";
import { ContactStateLead } from "../../email-components";

export const Waiver1915bStateEmail = (props: {
  variables: WithdrawPackage & CommonVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <p>
        This email is to confirm {variables.authority} Waiver {variables.id} was
        withdrawn by {variables.submitterName}. The review of
        {variables.authority} Waiver {variables.id} has concluded.
      </p>
      <ContactStateLead />
    </Html>
  );
};

const Waiver1915bStateEmailPreview = () => {
  return (
    <Waiver1915bStateEmail
      variables={emailTemplateValue as WithdrawPackage & CommonVariables}
    />
  );
};

export default Waiver1915bStateEmailPreview;
