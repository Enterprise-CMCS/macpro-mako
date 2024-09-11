import * as React from "react";
import { Html } from "@react-email/components";
import { WithdrawPackage } from "shared-types";
import { CommonVariables } from "../..";
import { PackageDetails, ContactStateLead } from "../email-components";

// **** MEDICAID SPA
export const MedSpaCMSEmail = (props: {
  variables: WithdrawPackage & CommonVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <h3>
        The OneMAC Submission Portal received a request to withdraw the package
        below. The package will no longer be considered for CMS review:
      </h3>
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          Name: variables.submitterName,
          Email: variables.submitterEmail,
          "Medicaid SPA Package ID": variables.id,
        }}
        summary={variables.additionalInformation ?? null}
      />
    </Html>
  );
};

export const MedSpaStateEmail = (props: {
  variables: WithdrawPackage & CommonVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <h3>
        This email is to confirm Medicaid SPA {variables.id} was withdrawn by
        {variables.submitterName}. The review of Medicaid SPA {variables.id} has
        concluded.
      </h3>
      <ContactStateLead />
    </Html>
  );
};

// **** CHIP SPA
export const ChipSpaCMSEmail = (props: {
  variables: WithdrawPackage & CommonVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <h3>
        The OneMAC Submission Portal received a request to withdraw the package
        below. The package will no longer be considered for CMS review:
      </h3>
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          Name: variables.submitterName,
          Email: variables.submitterEmail,
          "CHIP SPA Package ID": variables.id,
        }}
        summary={variables.additionalInformation ?? null}
      />
    </Html>
  );
};

export const ChipSpaStateEmail = (props: {
  variables: WithdrawPackage & CommonVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <h3>
        This email is to confirm CHIP SPA {variables.id} was withdrawn by
        {variables.submitterName}. The review of CHIP SPA {variables.id} has
        concluded.
      </h3>
      <ContactStateLead isChip />
    </Html>
  );
};

// 1915b
export const Waiver1915bCMSEmail = (props: {
  variables: WithdrawPackage & CommonVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <h3>
        The OneMAC Submission Portal received a request to withdraw the package
        below. The package will no longer be considered for CMS review:
      </h3>
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          Name: variables.submitterName,
          Email: variables.submitterEmail,
          [`${variables.authority} Package ID`]: variables.id,
        }}
        summary={variables.additionalInformation ?? null}
      />
    </Html>
  );
};

export const Waiver1915bStateEmail = (props: {
  variables: WithdrawPackage & CommonVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <h3>
        This email is to confirm {variables.authority} Waiver {variables.id} was
        withdrawn by {variables.submitterName}. The review of
        {variables.authority} Waiver {variables.id} has concluded.
      </h3>
      <ContactStateLead />
    </Html>
  );
};

export default MedSpaCMSEmail;
