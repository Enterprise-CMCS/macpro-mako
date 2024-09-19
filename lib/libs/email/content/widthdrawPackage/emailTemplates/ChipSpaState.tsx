import * as React from "react";
import { emailTemplateValue } from "../data";
import { CommonVariables } from "../../..";
import { WithdrawPackage } from "shared-types";
import { Html } from "@react-email/components";
import { ContactStateLead } from "../../email-components";

export const ChipSpaStateEmail = (props: {
  variables: WithdrawPackage & CommonVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <p>
        This email is to confirm CHIP SPA {variables.id} was withdrawn by
        {variables.submitterName}. The review of CHIP SPA {variables.id} has
        concluded.
      </p>
      <ContactStateLead isChip />
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
