import * as React from "react";
import { emailTemplateValue } from "../data";
import { CommonVariables } from "../../..";
import { WithdrawPackage } from "shared-types";
import { Html } from "@react-email/components";
import { ContactStateLead } from "../../email-components";

export const MedSpaStateEmail = (props: {
  variables: WithdrawPackage & CommonVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <p>
        This email is to confirm Medicaid SPA {variables.id} was withdrawn by
        {variables.submitterName}. The review of Medicaid SPA {variables.id} has
        concluded.
      </p>
      <ContactStateLead />
    </Html>
  );
};

const MedSpaCMSEmailPreview = () => {
  return (
    <MedSpaStateEmail
      variables={emailTemplateValue as WithdrawPackage & CommonVariables}
    />
  );
};

export default MedSpaCMSEmailPreview;
